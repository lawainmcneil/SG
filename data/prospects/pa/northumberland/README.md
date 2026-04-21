# Northumberland County Safe Prospect Pack

This folder is the Pennsylvania starter pack for the SHERPA safe prospect workflow.

## What Goes Here

Drop the county assessment or parcel CSV export into:

- [inbox](/Users/lawainmcneil/Documents/New%20project/data/prospects/pa/northumberland/inbox)

Recommended filename:

- `northumberland_county_export.csv`

## Run

```bash
python3 /Users/lawainmcneil/Documents/New\ project/build_safe_prospect_registry.py \
  --preset pa-northumberland \
  --parcels /Users/lawainmcneil/Documents/New\ project/data/prospects/pa/northumberland/inbox/northumberland_county_export.csv \
  --output-dir /Users/lawainmcneil/Documents/New\ project/data/prospects/pa/northumberland/output
```

## Output

The generated files will land in:

- [output](/Users/lawainmcneil/Documents/New%20project/data/prospects/pa/northumberland/output)

## Official County Source

Northumberland County’s official assessment page says:

- property records can be requested by email to `assessmentdatarequest@northumberlandcountypa.gov`
- parcel information can be extracted digitally from the assessment database for a fee

Official pages:

- [Northumberland County Assessment](https://northumberlandcountypa.gov/assessment/)
- [Northumberland County Assessment Services](https://northumberlandcountypa.gov/assessment-services/)

Inference from those pages:

- the cleanest safe workflow is to request a parcel/property extract directly from the county
- once you receive the CSV, drop it into `inbox` and run the command above

## Demo Output

There is also a sample run in:

- [demo_output](/Users/lawainmcneil/Documents/New%20project/data/prospects/pa/northumberland/demo_output)

That demo is based on the local sample file, not a real county export.
