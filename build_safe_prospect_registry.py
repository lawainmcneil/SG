#!/usr/bin/env python3
"""Build a compliant public-record prospect registry for advisor outreach.

This pipeline is intentionally narrow:
- It accepts county/public parcel-style CSV exports.
- It strips the workflow down to name, address, parcel, tenure, and value data.
- It refuses common sensitive/background-report style columns by default.
- It produces transparent tags, scores, and provenance for advisor planning.

It is not designed for housing, employment, insurance underwriting, or other
eligibility decisions, and it does not append phone numbers, email addresses,
credit attributes, criminal history, or other consumer-report style fields.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from statistics import quantiles
from typing import Dict, Iterable, List, Optional, Sequence


FIELD_ALIASES = {
    "owner_name": (
        "owner_name",
        "owner",
        "owner1",
        "owner name",
        "owner_name_1",
        "taxpayer_name",
    ),
    "parcel_id": ("parcel_id", "parcel", "parcel_number", "parcel number", "apn", "folio"),
    "property_address": (
        "property_address",
        "site_address",
        "property address",
        "situs_address",
        "physical_address",
    ),
    "property_city": ("property_city", "site_city", "situs_city", "property city"),
    "property_state": ("property_state", "site_state", "situs_state", "property state"),
    "property_zip": ("property_zip", "site_zip", "situs_zip", "property zip"),
    "mailing_address": (
        "mailing_address",
        "owner_address",
        "tax_address",
        "mail_address",
        "mailing address",
    ),
    "mailing_city": ("mailing_city", "owner_city", "mail_city", "mailing city"),
    "mailing_state": ("mailing_state", "owner_state", "mail_state", "mailing state"),
    "mailing_zip": ("mailing_zip", "owner_zip", "mail_zip", "mailing zip"),
    "county": ("county", "county_name", "county name"),
    "state": ("state", "state_abbr", "state abbreviation"),
    "assessed_value": (
        "assessed_value",
        "market_value",
        "just_value",
        "total_assessed_value",
        "appraised_value",
        "assessed value",
    ),
    "sale_date": ("sale_date", "last_sale_date", "deed_date", "sale date"),
    "sale_year": ("sale_year", "year_purchased", "purchase_year", "sale year"),
    "land_use": ("land_use", "property_class", "use_code", "land use"),
    "homestead_flag": ("homestead_flag", "homestead", "owner_occupied_flag"),
}


PROHIBITED_FIELD_MARKERS = (
    "ssn",
    "social_security",
    "date_of_birth",
    "dob",
    "birth",
    "driver",
    "license",
    "dln",
    "medical",
    "health",
    "claim",
    "criminal",
    "felony",
    "misdemeanor",
    "eviction",
    "bankruptcy",
    "credit",
    "tradeline",
    "fico",
    "email",
    "phone",
    "mobile",
    "cell",
)


ENTITY_MARKERS = (" LLC", " LLP", " LP", " INC", " CORP", " CO ", " COMPANY", " HOLDINGS")
TRUST_MARKERS = (" TRUST", " TTEE", " TRUSTEE")
PA_WATCHLIST_COUNTIES = {
    ("PA", "NORTHUMBERLAND COUNTY"),
    ("PA", "LYCOMING COUNTY"),
    ("PA", "MONTOUR COUNTY"),
    ("PA", "UNION COUNTY"),
}


def normalize_key(value: str) -> str:
    return "".join(ch.lower() for ch in value.strip() if ch.isalnum() or ch == "_")


def find_field(fieldnames: Iterable[str], aliases: Sequence[str]) -> Optional[str]:
    normalized = {normalize_key(name): name for name in fieldnames if name}
    for alias in aliases:
        match = normalized.get(normalize_key(alias))
        if match:
            return match
    return None


def csv_rows(path: Path) -> List[Dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise ValueError(f"{path} does not contain CSV headers.")
        return list(reader)


def load_presets(path: Path) -> Dict[str, Dict[str, object]]:
    return json.loads(path.read_text(encoding="utf-8"))


def detect_prohibited_fields(fieldnames: Iterable[str]) -> List[str]:
    hits: List[str] = []
    for name in fieldnames:
        key = normalize_key(name)
        if any(marker in key for marker in PROHIBITED_FIELD_MARKERS):
            hits.append(name)
    return hits


def clean_text(value: object) -> str:
    return " ".join(str(value or "").strip().split())


def clean_zip(value: object) -> str:
    digits = "".join(ch for ch in str(value or "") if ch.isdigit())
    return digits[:5].zfill(5) if digits else ""


def to_float(value: object) -> float:
    raw = str(value or "").strip().replace(",", "").replace("$", "")
    if not raw:
        return 0.0
    try:
        return float(raw)
    except ValueError:
        return 0.0


def parse_date(value: object) -> Optional[date]:
    raw = clean_text(value)
    if not raw:
        return None
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%Y/%m/%d", "%m-%d-%Y"):
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue
    if raw.isdigit() and len(raw) == 4:
        try:
            return date(int(raw), 1, 1)
        except ValueError:
            return None
    return None


def join_address(street: str, city: str, state: str, postal: str) -> str:
    parts = [clean_text(street), clean_text(city), clean_text(state), clean_zip(postal)]
    return ", ".join(part for part in parts if part)


def normalize_owner(value: str) -> str:
    return clean_text(value).upper()


def ownership_type(owner_name: str) -> str:
    if any(marker in owner_name for marker in TRUST_MARKERS):
        return "trust"
    if any(marker in f" {owner_name} " for marker in ENTITY_MARKERS):
        return "entity"
    return "individual"


def percentile_threshold(values: List[float], percentile: float) -> float:
    usable = sorted(value for value in values if value > 0)
    if not usable:
        return 0.0
    if len(usable) < 4:
        return usable[-1]
    quartiles = quantiles(usable, n=100, method="inclusive")
    return quartiles[max(0, min(99, int(percentile) - 1))]


@dataclass
class ProspectRecord:
    owner_name: str
    parcel_id: str
    property_address: str
    mailing_address: str
    county: str
    state: str
    zip_code: str
    assessed_value: float
    sale_date: Optional[date]
    land_use: str
    homestead_flag: str
    source_file: str
    source_system: str
    source_url: str
    collected_on: str
    county_ltc_score: float = 0.0
    tags: List[str] | None = None
    reasons: List[str] | None = None
    priority_score: float = 0.0


def load_county_scores(path: Optional[Path]) -> Dict[tuple[str, str], float]:
    if not path:
        return {}
    rows = csv_rows(path)
    if not rows:
        return {}
    fieldnames = rows[0].keys()
    county_field = find_field(fieldnames, ("county", "county_name"))
    state_field = find_field(fieldnames, ("state", "state_abbr"))
    score_field = find_field(fieldnames, ("opportunity_score", "score", "county_score"))
    if not county_field or not state_field or not score_field:
        raise ValueError("County score file is missing county/state/score columns.")
    scores: Dict[tuple[str, str], float] = {}
    for row in rows:
        county = clean_text(row.get(county_field, "")).upper()
        state = clean_text(row.get(state_field, "")).upper()
        if county and state:
            scores[(state, county)] = to_float(row.get(score_field, ""))
    return scores


def build_records(
    parcel_files: Sequence[Path],
    county_scores: Dict[tuple[str, str], float],
    source_system: str,
    source_url: str,
    collected_on: str,
    expected_county: str = "",
    expected_state: str = "",
) -> List[ProspectRecord]:
    records: List[ProspectRecord] = []
    expected_county_upper = clean_text(expected_county).upper()
    expected_state_upper = clean_text(expected_state).upper()
    for path in parcel_files:
        rows = csv_rows(path)
        if not rows:
            continue
        fieldnames = rows[0].keys()
        prohibited = detect_prohibited_fields(fieldnames)
        if prohibited:
            joined = ", ".join(prohibited[:8])
            raise ValueError(
                f"{path.name} includes prohibited fields ({joined}). "
                "Remove consumer-report style, contact, or sensitive columns before continuing."
            )

        fields = {
            key: find_field(fieldnames, aliases)
            for key, aliases in FIELD_ALIASES.items()
        }
        required = ("owner_name", "parcel_id", "property_address", "county", "state")
        missing = [name for name in required if not fields.get(name)]
        if missing:
            raise ValueError(f"{path.name} is missing required fields: {', '.join(missing)}")

        for row in rows:
            owner_name = normalize_owner(row.get(fields["owner_name"], ""))
            if not owner_name:
                continue
            property_address = join_address(
                row.get(fields["property_address"], ""),
                row.get(fields["property_city"], "") if fields.get("property_city") else "",
                row.get(fields["property_state"], "") if fields.get("property_state") else row.get(fields["state"], ""),
                row.get(fields["property_zip"], "") if fields.get("property_zip") else "",
            )
            mailing_address = join_address(
                row.get(fields["mailing_address"], "") if fields.get("mailing_address") else "",
                row.get(fields["mailing_city"], "") if fields.get("mailing_city") else "",
                row.get(fields["mailing_state"], "") if fields.get("mailing_state") else "",
                row.get(fields["mailing_zip"], "") if fields.get("mailing_zip") else "",
            )
            county = clean_text(row.get(fields["county"], ""))
            state = clean_text(row.get(fields["state"], "")).upper()
            if expected_county_upper and county.upper() != expected_county_upper:
                raise ValueError(
                    f"{path.name} contains county '{county}', expected '{expected_county}'. "
                    "Use the matching preset or correct the source file."
                )
            if expected_state_upper and state != expected_state_upper:
                raise ValueError(
                    f"{path.name} contains state '{state}', expected '{expected_state}'. "
                    "Use the matching preset or correct the source file."
                )
            zip_code = clean_zip(row.get(fields["property_zip"], "")) if fields.get("property_zip") else ""
            sale_date = None
            if fields.get("sale_date"):
                sale_date = parse_date(row.get(fields["sale_date"], ""))
            elif fields.get("sale_year"):
                sale_date = parse_date(row.get(fields["sale_year"], ""))

            county_key = (state, county.upper())
            records.append(
                ProspectRecord(
                    owner_name=owner_name,
                    parcel_id=clean_text(row.get(fields["parcel_id"], "")),
                    property_address=property_address,
                    mailing_address=mailing_address,
                    county=county,
                    state=state,
                    zip_code=zip_code,
                    assessed_value=to_float(row.get(fields["assessed_value"], "")) if fields.get("assessed_value") else 0.0,
                    sale_date=sale_date,
                    land_use=clean_text(row.get(fields["land_use"], "")) if fields.get("land_use") else "",
                    homestead_flag=clean_text(row.get(fields["homestead_flag"], "")) if fields.get("homestead_flag") else "",
                    source_file=path.name,
                    source_system=source_system,
                    source_url=source_url,
                    collected_on=collected_on,
                    county_ltc_score=county_scores.get(county_key, 0.0),
                )
            )
    return records


def enrich_records(records: List[ProspectRecord], years_for_long_tenure: int, ltc_threshold: float) -> None:
    owner_counts = Counter(record.owner_name for record in records)
    value_threshold = percentile_threshold([record.assessed_value for record in records], 75)
    current_year = date.today().year

    for record in records:
        tags: List[str] = []
        reasons: List[str] = []
        owner_type = ownership_type(record.owner_name)

        if record.mailing_address and record.property_address and record.mailing_address.upper() != record.property_address.upper():
            tags.append("absentee-owner")
            reasons.append("Mailing address differs from property address.")

        if owner_counts[record.owner_name] > 1:
            tags.append("multi-parcel-owner")
            reasons.append(f"Owner appears on {owner_counts[record.owner_name]} parcels in the loaded dataset.")

        if owner_type == "trust":
            tags.append("trust-owned")
            reasons.append("Owner name indicates trust ownership.")
        elif owner_type == "entity":
            tags.append("entity-owned")
            reasons.append("Owner name indicates business/entity ownership.")

        if record.assessed_value and record.assessed_value >= value_threshold and value_threshold > 0:
            tags.append("high-property-value")
            reasons.append("Assessed value is in the top quartile of the loaded dataset.")

        if record.sale_date:
            years_held = current_year - record.sale_date.year
            if years_held >= years_for_long_tenure:
                tags.append("long-tenure-owner")
                reasons.append(f"Recorded ownership tenure is approximately {years_held} years.")

        if record.county_ltc_score >= ltc_threshold:
            tags.append("ltc-priority-county")
            reasons.append(f"County LTC opportunity score is {record.county_ltc_score:.1f}.")

        if (record.state, record.county.upper()) in PA_WATCHLIST_COUNTIES:
            tags.append("pa-watchlist-county")
            reasons.append("Record sits inside the SHERPA Pennsylvania watchlist.")

        if {"high-property-value", "long-tenure-owner"} & set(tags):
            tags.append("legacy-planning-likely")
            reasons.append("Property profile suggests estate, liquidity, or legacy planning relevance.")

        score = 0.0
        score += 24 if "high-property-value" in tags else 0
        score += 18 if "multi-parcel-owner" in tags else 0
        score += 12 if "trust-owned" in tags else 0
        score += 10 if "entity-owned" in tags else 0
        score += 12 if "absentee-owner" in tags else 0
        score += 14 if "long-tenure-owner" in tags else 0
        score += min(10, record.county_ltc_score / 10) if record.county_ltc_score else 0
        record.tags = sorted(set(tags))
        record.reasons = reasons
        record.priority_score = min(100.0, round(score, 1))


def write_csv(path: Path, rows: List[Dict[str, object]], fieldnames: Sequence[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def prospect_id(record: ProspectRecord) -> str:
    digest = hashlib.sha1(
        f"{record.owner_name}|{record.parcel_id}|{record.property_address}|{record.source_file}".encode("utf-8")
    ).hexdigest()
    return digest[:12]


def output_rows(records: List[ProspectRecord]) -> tuple[List[Dict[str, object]], List[Dict[str, object]]]:
    registry_rows: List[Dict[str, object]] = []
    audit_rows: List[Dict[str, object]] = []
    for record in sorted(records, key=lambda item: item.priority_score, reverse=True):
        pid = prospect_id(record)
        registry_rows.append(
            {
                "prospect_id": pid,
                "owner_name": record.owner_name,
                "parcel_id": record.parcel_id,
                "property_address": record.property_address,
                "mailing_address": record.mailing_address,
                "county": record.county,
                "state": record.state,
                "zip_code": record.zip_code,
                "assessed_value": f"{record.assessed_value:.0f}" if record.assessed_value else "",
                "county_ltc_score": f"{record.county_ltc_score:.1f}" if record.county_ltc_score else "",
                "priority_score": f"{record.priority_score:.1f}",
                "ownership_type": ownership_type(record.owner_name),
                "tags": "; ".join(record.tags or []),
                "planning_reasons": " | ".join(record.reasons or []),
                "source_system": record.source_system,
                "source_file": record.source_file,
                "source_url": record.source_url,
                "collected_on": record.collected_on,
            }
        )
        audit_rows.append(
            {
                "prospect_id": pid,
                "owner_name": record.owner_name,
                "source_file": record.source_file,
                "source_system": record.source_system,
                "source_url": record.source_url,
                "collected_on": record.collected_on,
                "record_basis": "public property/tax record",
                "contains_phone": "no",
                "contains_email": "no",
                "contains_credit_or_criminal_fields": "no",
                "permitted_use_note": "Advisor outreach prioritization only; not for eligibility or adverse decisions.",
            }
        )
    return registry_rows, audit_rows


def write_summary(path: Path, records: List[ProspectRecord]) -> None:
    tag_counts: Dict[str, int] = defaultdict(int)
    state_counts: Dict[str, int] = defaultdict(int)
    for record in records:
        state_counts[record.state] += 1
        for tag in record.tags or []:
            tag_counts[tag] += 1

    summary = {
        "record_count": len(records),
        "states": dict(sorted(state_counts.items())),
        "top_tags": dict(sorted(tag_counts.items(), key=lambda item: item[1], reverse=True)),
        "generated_on": datetime.now().isoformat(timespec="seconds"),
        "workflow_type": "safe_public_record_prospect_registry",
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(summary, indent=2), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--parcels", nargs="+", required=True, help="One or more county/public parcel CSV exports.")
    parser.add_argument("--county-scores", help="Optional county opportunity score CSV to blend with parcel tags.")
    parser.add_argument("--output-dir", required=True, help="Directory for registry, audit, and summary outputs.")
    parser.add_argument(
        "--preset",
        help="Optional preset key from safe_prospect_presets.json, for example pa-northumberland.",
    )
    parser.add_argument("--presets-file", default="safe_prospect_presets.json", help="Path to JSON presets file.")
    parser.add_argument("--source-system", default="county property records", help="Source system label for provenance.")
    parser.add_argument("--source-url", default="", help="Optional public source URL recorded on each output row.")
    parser.add_argument("--expected-county", default="", help="Optional county name to enforce across input rows.")
    parser.add_argument("--expected-state", default="", help="Optional state abbreviation to enforce across input rows.")
    parser.add_argument(
        "--collected-on",
        default=date.today().isoformat(),
        help="Collection date stored in provenance output. Defaults to today.",
    )
    parser.add_argument("--long-tenure-years", type=int, default=10, help="Years held before long-tenure tag is added.")
    parser.add_argument(
        "--ltc-threshold",
        type=float,
        default=60.0,
        help="County LTC score threshold for the ltc-priority-county tag.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    parcel_files = [Path(value).expanduser().resolve() for value in args.parcels]
    output_dir = Path(args.output_dir).expanduser().resolve()
    presets: Dict[str, Dict[str, object]] = {}
    if args.preset:
        presets_path = Path(args.presets_file).expanduser().resolve()
        presets = load_presets(presets_path)
        if args.preset not in presets:
            raise ValueError(f"Preset '{args.preset}' not found in {presets_path.name}.")
        preset = presets[args.preset]
        if args.source_system == "county property records" and preset.get("source_system"):
            args.source_system = str(preset["source_system"])
        if not args.source_url and preset.get("source_url"):
            args.source_url = str(preset["source_url"])
        if not args.expected_county and preset.get("county"):
            args.expected_county = str(preset["county"])
        if not args.expected_state and preset.get("state"):
            args.expected_state = str(preset["state"])
    county_scores = load_county_scores(Path(args.county_scores).expanduser().resolve()) if args.county_scores else {}

    records = build_records(
        parcel_files=parcel_files,
        county_scores=county_scores,
        source_system=args.source_system,
        source_url=args.source_url,
        collected_on=args.collected_on,
        expected_county=args.expected_county,
        expected_state=args.expected_state,
    )
    enrich_records(records, years_for_long_tenure=args.long_tenure_years, ltc_threshold=args.ltc_threshold)
    registry_rows, audit_rows = output_rows(records)

    write_csv(
        output_dir / "safe_prospect_registry.csv",
        registry_rows,
        (
            "prospect_id",
            "owner_name",
            "parcel_id",
            "property_address",
            "mailing_address",
            "county",
            "state",
            "zip_code",
            "assessed_value",
            "county_ltc_score",
            "priority_score",
            "ownership_type",
            "tags",
            "planning_reasons",
            "source_system",
            "source_file",
            "source_url",
            "collected_on",
        ),
    )
    write_csv(
        output_dir / "safe_prospect_audit.csv",
        audit_rows,
        (
            "prospect_id",
            "owner_name",
            "source_file",
            "source_system",
            "source_url",
            "collected_on",
            "record_basis",
            "contains_phone",
            "contains_email",
            "contains_credit_or_criminal_fields",
            "permitted_use_note",
        ),
    )
    write_summary(output_dir / "safe_prospect_summary.json", records)


if __name__ == "__main__":
    main()
