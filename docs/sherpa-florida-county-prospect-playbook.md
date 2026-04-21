# SHERPA Florida County Prospect Playbook

## Counties In Scope

- Sarasota County, FL
- Martin County, FL

## Live Public Data Status

As of April 20, 2026, both counties show live official property-search capability:

- Sarasota County Property Appraiser includes `Real Property Search`, `Advanced Search`, `Map Property Search`, `Download Data`, and `Records Request` paths.
- Martin County Property Appraiser includes `Property Appraiser Data`, `County Data`, `Sales Data`, `Data Downloads`, and `Information Requests`.

Official sources:

- [Sarasota County Property Appraiser](https://www.sc-pa.com/home/)
- [Sarasota Property Search](https://www.sc-pa.com/propertysearch/)
- [Martin County Property Appraiser](https://www.pamartinfl.gov/)
- [Martin County Property Information Lookup](https://www.martin.fl.us/PropertyLookup)

Inference:

- live public property data is available in Florida through county portals
- for the safe SHERPA workflow, county export/download or records-request data is still better than scraping ad hoc search results

## Sarasota Starter

Preset key:

- `fl-sarasota`

Run:

```bash
python3 /Users/lawainmcneil/Documents/New\ project/build_safe_prospect_registry.py \
  --preset fl-sarasota \
  --parcels /path/to/sarasota_county_export.csv \
  --output-dir /tmp/sarasota_safe_output
```

## Safe Guardrails

- property/tax/parcel records only
- no phone append
- no email append
- no DOB, SSN, credit, criminal, or medical fields
- manual advisor review before outreach
- separate DNC/internal suppression before any call workflow
