#!/usr/bin/env python3
"""Build metro ZIP opportunity data for SHERPA LTC Analyzer.

Inputs:
- IRS SOI ZIP CSV files for the states that participate in each metro
- HUD USPS ZIP-to-county or county-to-ZIP crosswalk CSV

Outputs:
- zip_detail.csv
- zip_scored.csv
- metro_zip_summary.csv
- metro_zip_data.js

The scoring model is intentionally lightweight and public-data only. It uses
IRS ZIP-level tax items as wealth proxies and HUD address ratios to keep ZIPs
inside the intended metro counties.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import os
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence
from xml.etree import ElementTree as ET
import zipfile
from urllib.parse import urlencode
from urllib.request import Request, urlopen


@dataclass(frozen=True)
class CountyRef:
    state_fips: str
    county_fips: str
    county_name: str

    @property
    def geoid(self) -> str:
        return f"{self.state_fips}{self.county_fips}"


METROS: Dict[str, Dict[str, Sequence[CountyRef]]] = {
    "chicago": {
        "display_name": "Greater Chicago",
        "counties": (
            CountyRef("17", "031", "Cook County, IL"),
            CountyRef("17", "037", "DeKalb County, IL"),
            CountyRef("17", "043", "DuPage County, IL"),
            CountyRef("17", "063", "Grundy County, IL"),
            CountyRef("17", "089", "Kane County, IL"),
            CountyRef("17", "093", "Kendall County, IL"),
            CountyRef("17", "097", "Lake County, IL"),
            CountyRef("17", "111", "McHenry County, IL"),
            CountyRef("17", "197", "Will County, IL"),
            CountyRef("18", "073", "Jasper County, IN"),
            CountyRef("18", "089", "Lake County, IN"),
            CountyRef("18", "111", "Newton County, IN"),
            CountyRef("18", "127", "Porter County, IN"),
            CountyRef("55", "059", "Kenosha County, WI"),
        ),
    },
    "baltimore": {
        "display_name": "Greater Baltimore",
        "counties": (
            CountyRef("24", "003", "Anne Arundel County, MD"),
            CountyRef("24", "005", "Baltimore County, MD"),
            CountyRef("24", "013", "Carroll County, MD"),
            CountyRef("24", "025", "Harford County, MD"),
            CountyRef("24", "027", "Howard County, MD"),
            CountyRef("24", "035", "Queen Anne's County, MD"),
            CountyRef("24", "510", "Baltimore city, MD"),
        ),
    },
}


IRS_FIELD_ALIASES = {
    "zip": ("zipcode", "zip_code", "zip", "zip code", "zip code [1]"),
    "returns": ("n1", "returns", "number_of_returns", "number of returns [2]"),
    "agi": ("a00100", "agi", "adjusted_gross_income", "adjusted gross income (agi) [7]"),
    "interest": ("a00300", "taxable_interest", "interest_received", "interest", "taxable interest amount"),
    "dividends": ("a00600", "ordinary_dividends", "dividends", "dividends_before_exclusion", "ordinary dividends amount"),
    "city": ("zipcode_city", "city", "zip_city", "zipcodecity"),
    "state": ("state", "state_abbreviation", "stateabbr"),
    "agi_stub": ("agi_stub", "agistub", "agi bracket", "agi_bracket", "size of adjusted gross income"),
}

HUD_FIELD_ALIASES = {
    "zip": ("zip", "zipcode", "usps_zip", "5_digit_zip"),
    "county": ("county", "countyfp", "county_geoid", "countyfips"),
    "tot_ratio": ("tot_ratio", "total_ratio"),
    "res_ratio": ("res_ratio", "residential_ratio"),
    "city": ("usps_zip_pref_city", "zip_city", "city"),
}

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkgrel": "http://schemas.openxmlformats.org/package/2006/relationships",
}
HUD_API_BASE = "https://www.huduser.gov/hudapi/public/usps"


def normalize_name(value: str) -> str:
    return "".join(ch.lower() for ch in value.strip() if ch.isalnum() or ch == "_")


def find_field(fieldnames: Iterable[str], aliases: Sequence[str]) -> Optional[str]:
    normalized = {normalize_name(name): name for name in fieldnames if name}
    normalized_no_digits = {
        "".join(ch for ch in key if not ch.isdigit()): original
        for key, original in normalized.items()
    }
    for alias in aliases:
        alias_key = normalize_name(alias)
        match = normalized.get(alias_key)
        if match:
            return match
        alias_no_digits = "".join(ch for ch in alias_key if not ch.isdigit())
        match = normalized_no_digits.get(alias_no_digits)
        if match:
            return match
    return None


def to_float(value: object) -> float:
    if value in (None, "", "null"):
        return 0.0
    try:
        return float(str(value).replace(",", "").strip())
    except ValueError:
        return 0.0


def to_int(value: object) -> int:
    return int(round(to_float(value)))


def safe_zip(value: object) -> str:
    raw = str(value or "").strip()
    digits = "".join(ch for ch in raw if ch.isdigit())
    if not digits:
        return ""
    return digits.zfill(5)[:5]


def parse_stub_rank(value: object) -> int:
    raw = str(value or "").strip()
    digits = "".join(ch for ch in raw if ch.isdigit())
    return int(digits) if digits else -1


def fetch_json(url: str, headers: Optional[Dict[str, str]] = None) -> Dict[str, object]:
    request = Request(url, headers=headers or {})
    with urlopen(request) as response:
        return json.load(response)


def column_index_from_ref(cell_ref: str) -> int:
    letters = "".join(ch for ch in cell_ref if ch.isalpha()).upper()
    value = 0
    for char in letters:
        value = (value * 26) + (ord(char) - 64)
    return max(0, value - 1)


def parse_xlsx_shared_strings(book: zipfile.ZipFile) -> List[str]:
    if "xl/sharedStrings.xml" not in book.namelist():
        return []
    root = ET.fromstring(book.read("xl/sharedStrings.xml"))
    values: List[str] = []
    for item in root.findall("main:si", NS):
        text_parts = [node.text or "" for node in item.findall(".//main:t", NS)]
        values.append("".join(text_parts))
    return values


def resolve_first_sheet_path(book: zipfile.ZipFile) -> str:
    workbook = ET.fromstring(book.read("xl/workbook.xml"))
    sheets = workbook.find("main:sheets", NS)
    if sheets is None or not list(sheets):
        raise ValueError("No worksheets found in XLSX file.")
    first_sheet = list(sheets)[0]
    rel_id = first_sheet.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
    rels = ET.fromstring(book.read("xl/_rels/workbook.xml.rels"))
    target = None
    for rel in rels.findall("pkgrel:Relationship", NS):
        if rel.attrib.get("Id") == rel_id:
            target = rel.attrib.get("Target")
            break
    if not target:
        raise ValueError("Could not resolve first worksheet relationship in XLSX file.")
    if target.startswith("/"):
        return target.lstrip("/")
    if not target.startswith("xl/"):
        return f"xl/{target}"
    return target


def parse_xlsx_rows(path: Path) -> List[Dict[str, object]]:
    with zipfile.ZipFile(path) as book:
        shared_strings = parse_xlsx_shared_strings(book)
        sheet_path = resolve_first_sheet_path(book)
        root = ET.fromstring(book.read(sheet_path))

    rows: List[List[str]] = []
    for row_node in root.findall(".//main:sheetData/main:row", NS):
        cells: Dict[int, str] = {}
        max_index = -1
        for cell in row_node.findall("main:c", NS):
            ref = cell.attrib.get("r", "")
            column_index = column_index_from_ref(ref)
            max_index = max(max_index, column_index)
            cell_type = cell.attrib.get("t", "")
            value = ""
            if cell_type == "s":
                node = cell.find("main:v", NS)
                if node is not None and node.text is not None:
                    shared_index = int(float(node.text))
                    value = shared_strings[shared_index] if 0 <= shared_index < len(shared_strings) else ""
            elif cell_type == "inlineStr":
                value = "".join(node.text or "" for node in cell.findall(".//main:t", NS))
            else:
                node = cell.find("main:v", NS)
                if node is not None and node.text is not None:
                    value = node.text
            cells[column_index] = value

        if max_index >= 0:
            rows.append([cells.get(index, "") for index in range(max_index + 1)])

    def is_candidate_header(row: List[str]) -> bool:
        normalized_values = [normalize_name(str(value)) for value in row if str(value).strip()]
        has_zip = any("zipcode" in value for value in normalized_values)
        has_returns = any("numberofreturns" in value for value in normalized_values)
        has_agi = any("adjustedgrossincome" in value or value == "agi" for value in normalized_values)
        return has_zip and has_returns and has_agi

    header_row = next((row for row in rows if is_candidate_header(row)), None)
    if header_row is None:
        header_row = next((row for row in rows if any(str(value).strip() for value in row)), None)
    if header_row is None:
        raise ValueError(f"No usable header row found in {path}")
    header_index = rows.index(header_row)
    secondary_header = rows[header_index + 1] if header_index + 1 < len(rows) else []
    tertiary_header = rows[header_index + 2] if header_index + 2 < len(rows) else []

    headers: List[str] = []
    last_primary = ""
    for index, value in enumerate(header_row):
        primary = str(value).strip()
        secondary = str(secondary_header[index]).strip() if index < len(secondary_header) else ""
        if primary:
            last_primary = primary
        base = primary or last_primary

        if secondary:
            secondary_clean = secondary.replace("\n", " ").strip()
            if base and secondary_clean and secondary_clean.lower() not in {"total"}:
                header_value = f"{base} {secondary_clean}".strip()
            else:
                header_value = secondary_clean or base
        else:
            header_value = base

        headers.append(header_value.strip())

    normalized_headers = []
    for index, header in enumerate(headers):
        normalized_headers.append(header or f"column_{index+1}")

    dict_rows: List[Dict[str, object]] = []
    data_start = header_index + 1
    while data_start < len(rows):
        row = rows[data_start]
        first = str(row[0]).strip() if row else ""
        second = str(row[1]).strip() if len(row) > 1 else ""
        if first.isdigit() and second:
            break
        data_start += 1

    for row in rows[data_start:]:
        if not any(str(value).strip() for value in row):
            continue
        padded = row + [""] * max(0, len(normalized_headers) - len(row))
        dict_rows.append(dict(zip(normalized_headers, padded)))
    return dict_rows


def iter_tabular_rows(path: Path) -> List[Dict[str, object]]:
    suffix = path.suffix.lower()
    if suffix == ".xlsx":
        return parse_xlsx_rows(path)
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise ValueError(f"No header row found in {path}")
        return list(reader)


def load_hud_crosswalk(path: Path, min_ratio: float) -> Dict[str, Dict[str, Dict[str, object]]]:
    rows = iter_tabular_rows(path)
    if not rows:
        raise ValueError(f"No rows found in {path}")

    fieldnames = rows[0].keys()
    zip_field = find_field(fieldnames, HUD_FIELD_ALIASES["zip"])
    county_field = find_field(fieldnames, HUD_FIELD_ALIASES["county"])
    ratio_field = (
        find_field(fieldnames, HUD_FIELD_ALIASES["tot_ratio"])
        or find_field(fieldnames, HUD_FIELD_ALIASES["res_ratio"])
    )
    city_field = find_field(fieldnames, HUD_FIELD_ALIASES["city"])

    if not zip_field or not county_field or not ratio_field:
        raise ValueError(
            "HUD crosswalk is missing one of the required columns: ZIP, COUNTY, TOT_RATIO/RES_RATIO."
        )

    metro_counties = {
        cfg["display_name"]: {county.geoid: county for county in cfg["counties"]}
        for cfg in METROS.values()
    }
    metro_zip_map: Dict[str, Dict[str, Dict[str, object]]] = {
        cfg["display_name"]: {} for cfg in METROS.values()
    }

    for row in rows:
        zip_code = safe_zip(row.get(zip_field))
        county_geoid = "".join(ch for ch in str(row.get(county_field, "")).strip() if ch.isdigit()).zfill(5)[:5]
        ratio = to_float(row.get(ratio_field))
        city = str(row.get(city_field, "")).strip() if city_field else ""
        if not zip_code or not county_geoid or ratio <= 0:
            continue

        for metro_name, counties in metro_counties.items():
            county = counties.get(county_geoid)
            if not county:
                continue
            bucket = metro_zip_map[metro_name].setdefault(
                zip_code,
                {
                    "metro": metro_name,
                    "zip": zip_code,
                    "crosswalk_ratio": 0.0,
                    "counties": [],
                    "city": city,
                },
            )
            bucket["crosswalk_ratio"] = min(1.0, float(bucket["crosswalk_ratio"]) + ratio)
            bucket["counties"].append(county.county_name)
            if city and not bucket["city"]:
                bucket["city"] = city

    filtered: Dict[str, Dict[str, Dict[str, object]]] = {}
    for metro_name, entries in metro_zip_map.items():
        filtered[metro_name] = {
            zip_code: {
                **payload,
                "counties": sorted(set(payload["counties"])),
            }
            for zip_code, payload in entries.items()
            if float(payload["crosswalk_ratio"]) >= min_ratio
        }
    return filtered


def load_hud_crosswalk_from_api(
    token: str,
    min_ratio: float,
    year: Optional[int] = None,
    quarter: Optional[int] = None,
) -> Dict[str, Dict[str, Dict[str, object]]]:
    metro_counties = {
        cfg["display_name"]: {county.geoid: county for county in cfg["counties"]}
        for cfg in METROS.values()
    }
    state_codes = sorted({county.state_fips for cfg in METROS.values() for county in cfg["counties"]})
    state_abbr_map = {
        "17": "IL",
        "18": "IN",
        "24": "MD",
        "55": "WI",
    }
    metro_zip_map: Dict[str, Dict[str, Dict[str, object]]] = {
        cfg["display_name"]: {} for cfg in METROS.values()
    }
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }

    for state_fips in state_codes:
        state_abbr = state_abbr_map.get(state_fips)
        if not state_abbr:
            continue
        params = {"type": 2, "query": state_abbr}
        if year:
            params["year"] = year
        if quarter:
            params["quarter"] = quarter
        payload = fetch_json(f"{HUD_API_BASE}?{urlencode(params)}", headers=headers)
        results = payload.get("data", {}).get("results", [])
        for row in results:
            zip_code = safe_zip(row.get("zip"))
            county_geoid = "".join(ch for ch in str(row.get("geoid", "")).strip() if ch.isdigit()).zfill(5)[:5]
            ratio = to_float(row.get("tot_ratio") or row.get("res_ratio"))
            city = str(row.get("city", "")).strip()
            if not zip_code or not county_geoid or ratio <= 0:
                continue

            for metro_name, counties in metro_counties.items():
                county = counties.get(county_geoid)
                if not county:
                    continue
                bucket = metro_zip_map[metro_name].setdefault(
                    zip_code,
                    {
                        "metro": metro_name,
                        "zip": zip_code,
                        "crosswalk_ratio": 0.0,
                        "counties": [],
                        "city": city,
                    },
                )
                bucket["crosswalk_ratio"] = min(1.0, float(bucket["crosswalk_ratio"]) + ratio)
                bucket["counties"].append(county.county_name)
                if city and not bucket["city"]:
                    bucket["city"] = city

    filtered: Dict[str, Dict[str, Dict[str, object]]] = {}
    for metro_name, entries in metro_zip_map.items():
        filtered[metro_name] = {
            zip_code: {
                **payload,
                "counties": sorted(set(payload["counties"])),
            }
            for zip_code, payload in entries.items()
            if float(payload["crosswalk_ratio"]) >= min_ratio
        }
    return filtered


def aggregate_irs_rows(paths: Sequence[Path], amount_scale: int) -> Dict[str, Dict[str, object]]:
    best_rows: Dict[str, Dict[str, object]] = {}

    for path in paths:
        rows = iter_tabular_rows(path)
        if not rows:
            raise ValueError(f"No rows found in {path}")

        fieldnames = rows[0].keys()
        zip_field = find_field(fieldnames, IRS_FIELD_ALIASES["zip"])
        returns_field = find_field(fieldnames, IRS_FIELD_ALIASES["returns"])
        agi_field = find_field(fieldnames, IRS_FIELD_ALIASES["agi"])
        interest_field = find_field(fieldnames, IRS_FIELD_ALIASES["interest"])
        dividends_field = find_field(fieldnames, IRS_FIELD_ALIASES["dividends"])
        city_field = find_field(fieldnames, IRS_FIELD_ALIASES["city"])
        state_field = find_field(fieldnames, IRS_FIELD_ALIASES["state"])
        agi_stub_field = find_field(fieldnames, IRS_FIELD_ALIASES["agi_stub"])

        required = [zip_field, returns_field, agi_field, interest_field, dividends_field]
        if any(field is None for field in required):
            raise ValueError(
                f"IRS file {path} is missing one of the required columns: ZIP, N1, A00100, A00300, A00600."
            )

        for row in rows:
            zip_code = safe_zip(row.get(zip_field))
            returns = to_int(row.get(returns_field))
            if not zip_code or returns <= 0:
                continue

            agi = to_float(row.get(agi_field)) * amount_scale
            interest = to_float(row.get(interest_field)) * amount_scale
            dividends = to_float(row.get(dividends_field)) * amount_scale
            stub_rank = parse_stub_rank(row.get(agi_stub_field)) if agi_stub_field else -1
            city = str(row.get(city_field, "")).strip() if city_field else ""
            state = str(row.get(state_field, "")).strip() if state_field else path.stem.upper()

            candidate = {
                "zip": zip_code,
                "state": state,
                "city": city,
                "returns": returns,
                "agi": agi,
                "interest": interest,
                "dividends": dividends,
                "stub_rank": stub_rank,
            }

            current = best_rows.get(zip_code)
            if current is None:
                best_rows[zip_code] = candidate
                continue

            current_key = (int(current["returns"]), -int(current.get("stub_rank", -1)))
            candidate_key = (returns, -stub_rank)
            if candidate_key > current_key:
                best_rows[zip_code] = candidate

    return best_rows


def normalize(values: Sequence[float]) -> List[float]:
    if not values:
        return []
    lo = min(values)
    hi = max(values)
    if hi == lo:
        return [0.5 for _ in values]
    return [(value - lo) / (hi - lo) for value in values]


def build_zip_rows(
    hud_zips: Dict[str, Dict[str, Dict[str, object]]],
    irs_rows: Dict[str, Dict[str, object]],
    min_returns: int,
) -> List[Dict[str, object]]:
    rows: List[Dict[str, object]] = []
    for metro_name, zip_map in hud_zips.items():
        for zip_code, crosswalk in zip_map.items():
            irs_row = irs_rows.get(zip_code)
            if not irs_row:
                continue
            returns = int(irs_row["returns"])
            if returns < min_returns:
                continue
            agi_per_return = (float(irs_row["agi"]) / returns) if returns else 0
            interest_per_return = (float(irs_row["interest"]) / returns) if returns else 0
            dividends_per_return = (float(irs_row["dividends"]) / returns) if returns else 0

            rows.append(
                {
                    "metro": metro_name,
                    "zip": zip_code,
                    "state": irs_row["state"],
                    "city": crosswalk["city"] or irs_row["city"],
                    "returns": returns,
                    "agi": round(float(irs_row["agi"]), 0),
                    "interest": round(float(irs_row["interest"]), 0),
                    "dividends": round(float(irs_row["dividends"]), 0),
                    "agiPerReturn": round(agi_per_return, 0),
                    "interestPerReturn": round(interest_per_return, 0),
                    "dividendsPerReturn": round(dividends_per_return, 0),
                    "crosswalkRatio": round(float(crosswalk["crosswalk_ratio"]), 4),
                    "countyCount": len(crosswalk["counties"]),
                    "counties": " | ".join(crosswalk["counties"]),
                }
            )
    return rows


def score_zip_rows(rows: Sequence[Dict[str, object]]) -> List[Dict[str, object]]:
    rows_by_metro: Dict[str, List[Dict[str, object]]] = defaultdict(list)
    for row in rows:
        rows_by_metro[str(row["metro"])].append(dict(row))

    scored_rows: List[Dict[str, object]] = []
    for metro_name, metro_rows in rows_by_metro.items():
        agi_norm = normalize([float(row["agiPerReturn"]) for row in metro_rows])
        interest_norm = normalize([float(row["interestPerReturn"]) for row in metro_rows])
        dividend_norm = normalize([float(row["dividendsPerReturn"]) for row in metro_rows])
        returns_norm = normalize([math.log10(max(float(row["returns"]), 1.0)) for row in metro_rows])
        ratio_norm = normalize([float(row["crosswalkRatio"]) for row in metro_rows])

        for index, row in enumerate(metro_rows):
            score = (
                agi_norm[index] * 0.45
                + interest_norm[index] * 0.18
                + dividend_norm[index] * 0.22
                + returns_norm[index] * 0.10
                + ratio_norm[index] * 0.05
            )
            row["score"] = round(score * 100, 1)
            if score >= 0.67:
                row["tier"] = "high"
            elif score >= 0.34:
                row["tier"] = "medium"
            else:
                row["tier"] = "low"
            scored_rows.append(row)

    return sorted(scored_rows, key=lambda row: (str(row["metro"]), -float(row["score"]), -float(row["agiPerReturn"])))


def build_summary_rows(rows: Sequence[Dict[str, object]]) -> List[Dict[str, object]]:
    rows_by_metro: Dict[str, List[Dict[str, object]]] = defaultdict(list)
    for row in rows:
        rows_by_metro[str(row["metro"])].append(row)

    summaries: List[Dict[str, object]] = []
    for metro_name, metro_rows in sorted(rows_by_metro.items()):
        total_returns = sum(int(row["returns"]) for row in metro_rows)
        weighted_agi = sum(float(row["agiPerReturn"]) * int(row["returns"]) for row in metro_rows)
        weighted_interest = sum(float(row["interestPerReturn"]) * int(row["returns"]) for row in metro_rows)
        weighted_dividends = sum(float(row["dividendsPerReturn"]) * int(row["returns"]) for row in metro_rows)
        avg_score = sum(float(row["score"]) * int(row["returns"]) for row in metro_rows) / total_returns if total_returns else 0
        summaries.append(
            {
                "metro": metro_name,
                "zip_count": len(metro_rows),
                "total_returns": total_returns,
                "weighted_agi_per_return": round(weighted_agi / total_returns, 0) if total_returns else 0,
                "weighted_interest_per_return": round(weighted_interest / total_returns, 0) if total_returns else 0,
                "weighted_dividends_per_return": round(weighted_dividends / total_returns, 0) if total_returns else 0,
                "weighted_score": round(avg_score, 1),
                "top_zip": metro_rows[0]["zip"],
                "top_zip_score": metro_rows[0]["score"],
            }
        )
    return summaries


def write_csv(path: Path, rows: Sequence[Dict[str, object]]) -> None:
    if not rows:
        return
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def write_js(path: Path, rows: Sequence[Dict[str, object]]) -> None:
    path.write_text(
        "const SHERPA_LTC_METRO_ZIP_DATA = " + json.dumps(list(rows), ensure_ascii=True) + ";\n",
        encoding="utf-8",
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--irs",
        nargs="+",
        required=True,
        help="One or more IRS ZIP CSV or XLSX files. For Greater Chicago include IL, IN, and WI; for Baltimore include MD.",
    )
    parser.add_argument(
        "--hud-crosswalk",
        default="",
        help="HUD ZIP-county or county-ZIP crosswalk CSV file containing ZIP, COUNTY, and TOT_RATIO or RES_RATIO.",
    )
    parser.add_argument(
        "--hud-token",
        default=os.getenv("HUD_USPS_API_TOKEN", ""),
        help="HUD USPS API bearer token. When supplied, the script can fetch ZIP-county crosswalk data directly from the HUD API.",
    )
    parser.add_argument(
        "--hud-year",
        type=int,
        default=None,
        help="Optional HUD USPS API year. Defaults to the latest year when omitted.",
    )
    parser.add_argument(
        "--hud-quarter",
        type=int,
        choices=[1, 2, 3, 4],
        default=None,
        help="Optional HUD USPS API quarter. Defaults to the latest quarter when omitted.",
    )
    parser.add_argument("--metro", choices=["all", "chicago", "baltimore"], default="all")
    parser.add_argument("--output-dir", default="ltc_zip_output")
    parser.add_argument("--amount-scale", type=int, default=1000, help="Scale IRS amount columns. SOI files typically use 1000.")
    parser.add_argument("--min-ratio", type=float, default=0.15, help="Minimum HUD ZIP-to-metro address ratio to keep a ZIP.")
    parser.add_argument("--min-returns", type=int, default=250, help="Minimum IRS returns required to keep a ZIP.")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    selected_metros = [args.metro] if args.metro != "all" else list(METROS)
    selected_display_names = {METROS[metro]["display_name"] for metro in selected_metros}

    if args.hud_token:
        hud_zip_map = load_hud_crosswalk_from_api(
            args.hud_token,
            args.min_ratio,
            year=args.hud_year,
            quarter=args.hud_quarter,
        )
    elif args.hud_crosswalk:
        hud_zip_map = load_hud_crosswalk(Path(args.hud_crosswalk), args.min_ratio)
    else:
        raise ValueError("Provide either --hud-crosswalk or --hud-token.")
    hud_zip_map = {
        metro_name: zip_map
        for metro_name, zip_map in hud_zip_map.items()
        if metro_name in selected_display_names
    }

    irs_rows = aggregate_irs_rows([Path(path) for path in args.irs], args.amount_scale)
    zip_rows = build_zip_rows(hud_zip_map, irs_rows, args.min_returns)
    scored_rows = score_zip_rows(zip_rows)
    summary_rows = build_summary_rows(scored_rows)

    write_csv(out_dir / "zip_detail.csv", zip_rows)
    write_csv(out_dir / "zip_scored.csv", scored_rows)
    write_csv(out_dir / "metro_zip_summary.csv", summary_rows)
    write_js(out_dir / "metro_zip_data.js", scored_rows)

    print(f"Wrote {out_dir / 'zip_detail.csv'}")
    print(f"Wrote {out_dir / 'zip_scored.csv'}")
    print(f"Wrote {out_dir / 'metro_zip_summary.csv'}")
    print(f"Wrote {out_dir / 'metro_zip_data.js'}")


if __name__ == "__main__":
    main()
