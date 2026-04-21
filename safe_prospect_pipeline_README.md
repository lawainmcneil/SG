# Safe Prospect Pipeline

This starter builds a public-record prospect registry for advisor outreach planning without drifting into background-report or people-search behavior.

## What It Does

- Accepts county/public parcel CSV exports.
- Normalizes owner names, parcel IDs, property addresses, mailing addresses, value fields, and tenure.
- Applies transparent planning tags such as `trust-owned`, `multi-parcel-owner`, `absentee-owner`, `high-property-value`, and `legacy-planning-likely`.
- Optionally blends in county-level LTC opportunity scores.
- Writes three outputs:
  - `safe_prospect_registry.csv`
  - `safe_prospect_audit.csv`
  - `safe_prospect_summary.json`

## What It Deliberately Does Not Do

- No phone, email, DOB, SSN, credit, criminal, medical, eviction, or driver-license fields.
- No broker-style people-search enrichment.
- No consumer-report logic for tenant, employment, credit, or insurance eligibility.
- No auto-dial or call-list creation.

If the input CSV includes common prohibited columns like `phone`, `email`, `dob`, `credit`, or `criminal`, the script fails fast.

## Compliance Guardrails

This workflow is designed around public property/tax records plus planning signals, not consumer reports.

- The FTC has said that if a company assembles and markets personal reports for employment or tenant screening, it may be operating as a consumer reporting agency under the FCRA.
  Source: [FTC on TruthFinder and Instant Checkmate](https://www.ftc.gov/news-events/news/press-releases/2023/09/ftc-says-truthfinder-instant-checkmate-deceived-users-about-background-report-accuracy-violated-fcra)
- The FTC has also highlighted that prescreened lists require a legally permissible purpose.
  Source: [FTC on Equifax prescreened lists](https://www.ftc.gov/news-events/news/press-releases/2012/10/ftc-settlements-require-equifax-forfeit-money-made-allegedly-improperly-selling-information-about)
- If outreach later includes telemarketing calls, you still need National Do Not Call and entity-specific suppression procedures.
  Sources:
  - [FTC Telemarketing Guidance](https://www.ftc.gov/business-guidance/advertising-marketing/telemarketing)
  - [FTC DNC Q&A](https://www.ftc.gov/business-guidance/resources/qa-telemarketers-sellers-about-dnc-provisions-tsr-0)
- California data broker obligations deserve a separate review if this grows beyond first-party advisor prospecting.
  Source: [CPPA Data Brokers](https://cppa.ca.gov/data_brokers/)

Inference from those sources:
- Keep this registry for advisor prioritization and outreach planning.
- Do not use it for underwriting, housing, employment, credit, insurance eligibility, or adverse-action decisions.
- Do not append third-party consumer-report attributes without a fresh legal/compliance review.

## Input Shape

Start from a county property or tax roll export. Flexible headers are supported, but the easiest path is to follow [safe_prospect_input.sample.csv](/Users/lawainmcneil/Documents/New%20project/safe_prospect_input.sample.csv).

For a Pennsylvania-first workflow, start from [safe_prospect_pa_northumberland.sample.csv](/Users/lawainmcneil/Documents/New%20project/safe_prospect_pa_northumberland.sample.csv) and the preset keys in [safe_prospect_presets.json](/Users/lawainmcneil/Documents/New%20project/safe_prospect_presets.json).

For a Florida live-data workflow, start from [safe_prospect_fl_sarasota.sample.csv](/Users/lawainmcneil/Documents/New%20project/safe_prospect_fl_sarasota.sample.csv) and the `fl-sarasota` preset.

Minimum useful columns:

- `owner_name`
- `parcel_id`
- `property_address`
- `county`
- `state`

Helpful optional columns:

- `mailing_address`
- `property_zip`
- `assessed_value`
- `sale_date`
- `land_use`
- `homestead_flag`

## Run

```bash
python3 /Users/lawainmcneil/Documents/New\ project/build_safe_prospect_registry.py \
  --parcels /path/to/county_export.csv \
  --county-scores /Users/lawainmcneil/Documents/New\ project/florida_county_ltc_opportunity.csv \
  --source-url https://example-county.gov/property-search \
  --output-dir /tmp/safe_prospect_output
```

Example with multiple counties:

```bash
python3 /Users/lawainmcneil/Documents/New\ project/build_safe_prospect_registry.py \
  --parcels /path/to/baltimore_county.csv /path/to/lake_county_il.csv \
  --output-dir /tmp/safe_prospect_output
```

Pennsylvania county preset example:

```bash
python3 /Users/lawainmcneil/Documents/New\ project/build_safe_prospect_registry.py \
  --preset pa-northumberland \
  --parcels /path/to/northumberland_county_export.csv \
  --output-dir /tmp/northumberland_safe_output
```

The included preset keys are:

- `fl-sarasota`
- `pa-northumberland`
- `pa-lycoming`
- `pa-montour`
- `pa-union`

## Outputs

### `safe_prospect_registry.csv`

Safe planning view with:

- owner name
- parcel and address
- assessed value
- county/state
- tags
- transparent reasons
- priority score
- provenance

### `safe_prospect_audit.csv`

Minimal audit file that records:

- source file
- source system
- source URL
- collection date
- that prohibited contact/background fields were not carried through

### `safe_prospect_summary.json`

Counts by state and top tags for a quick sanity check.

## Recommended Workflow

1. Export one county parcel/tax CSV from a public county source.
2. Remove any non-public or sensitive columns before running the pipeline.
3. Generate the safe registry.
4. Review top rows manually for data quality and planning relevance.
5. If you later add phone outreach, scrub against DNC and your internal suppression list in a separate controlled workflow.
