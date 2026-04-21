# SHERPA Pennsylvania County Prospect Playbook

## Counties In Scope

- Northumberland County, PA
- Lycoming County, PA
- Montour County, PA
- Union County, PA

## Safe Starting Point

Use public county assessment or parcel exports only.

Good first fields:

- owner name
- parcel ID
- property address
- mailing address
- county
- state
- assessed value
- last sale date

Do not include:

- phone
- email
- DOB
- SSN
- credit or criminal fields
- skip-trace or people-search enrichment

## Preset Keys

The pipeline now includes these ready-to-run preset keys:

- `pa-northumberland`
- `pa-lycoming`
- `pa-montour`
- `pa-union`

Each preset enforces the county/state labels so a mismatched export gets caught early.

## Northumberland County Example

```bash
python3 /Users/lawainmcneil/Documents/New\ project/build_safe_prospect_registry.py \
  --preset pa-northumberland \
  --parcels /path/to/northumberland_county_export.csv \
  --output-dir /tmp/northumberland_safe_output
```

## What To Review After The Run

1. Confirm the top rows are genuinely in the county you intended.
2. Spot-check mailing vs property address formatting.
3. Review trust/entity names manually before outreach.
4. Keep provenance intact.
5. Apply DNC and internal suppression only in a separate outreach workflow.

## Why This Is The Right Pennsylvania Starting Point

These counties are already on the SHERPA watchlist, so a county-by-county parcel workflow gives you:

- locally grounded prospecting
- explainable planning signals
- lower compliance risk than a people-search model
- a direct path to advisor review before any contact
