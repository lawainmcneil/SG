# SHERPA ZIP Public-Data Pipeline

This pipeline builds metro ZIP concentration data for the SHERPA LTC Analyzer using official public sources.

## Inputs

1. IRS SOI ZIP code data for the states in scope
   - Greater Chicago: `Illinois`, `Indiana`, `Wisconsin`
   - Greater Baltimore: `Maryland`
   - Source: [IRS SOI ZIP Code Data 2022](https://www.irs.gov/statistics/soi-tax-stats-individual-income-tax-statistics-2022-zip-code-data-soi)
   - Accepted formats: the IRS `all states includes AGI` CSV or the IRS state `XLSX` downloads directly from that page

2. HUD USPS ZIP-to-county or county-to-ZIP crosswalk
   - Source: [HUD USPS ZIP Code Crosswalk Files](https://www.huduser.gov/portal/datasets/usps_crosswalk.html)
   - Accepted inputs:
     - downloaded `ZIP - County` or `County - ZIP` CSV
     - or a HUD USPS API bearer token

## Outputs

- `zip_detail.csv`
- `zip_scored.csv`
- `metro_zip_summary.csv`
- `metro_zip_data.js`

`metro_zip_data.js` is formatted so it can be copied into the app bundle as:

```js
const SHERPA_LTC_METRO_ZIP_DATA = [...];
```

## Run

```bash
python3 fetch_ltc_zip_public_data.py \
  --irs /path/to/Illinois.xlsx /path/to/Indiana.xlsx /path/to/Wisconsin.xlsx /path/to/Maryland.xlsx \
  --hud-crosswalk /path/to/ZIP_COUNTY_032026.csv \
  --output-dir /tmp/ltc_zip_output
```

## Run With HUD API Token

```bash
python3 fetch_ltc_zip_public_data.py \
  --irs /path/to/Illinois.xlsx /path/to/Indiana.xlsx /path/to/Wisconsin.xlsx /path/to/Maryland.xlsx \
  --hud-token YOUR_HUD_USPS_TOKEN \
  --hud-year 2026 \
  --hud-quarter 1 \
  --output-dir /tmp/ltc_zip_output
```

The script uses the HUD USPS API `type=2` `zip-county` crosswalk with bearer auth.

## Notes

- The script assumes IRS amount fields are reported in thousands of dollars and scales them by `1000` by default.
- The script keeps ZIPs only when at least `15%` of the HUD address ratio falls inside the target metro counties.
- If both `--hud-token` and `--hud-crosswalk` are supplied, the API token path is used.
- The scoring model is intentionally simple: AGI per return, interest per return, dividends per return, return count, and metro address ratio.
- This is a public-data ZIP screen, not a parcel-owner or household-level lead file.
