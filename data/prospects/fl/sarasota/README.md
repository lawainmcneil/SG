# Sarasota County Safe Prospect Pack

This folder is the Florida starter pack for the SHERPA safe prospect workflow.

## What Goes Here

Drop the Sarasota County property or parcel CSV export into:

- [inbox](/Users/lawainmcneil/Documents/New%20project/data/prospects/fl/sarasota/inbox)

Recommended filename:

- `sarasota_county_export.csv`

## Run

```bash
python3 /Users/lawainmcneil/Documents/New\ project/build_safe_prospect_registry.py \
  --preset fl-sarasota \
  --parcels /Users/lawainmcneil/Documents/New\ project/data/prospects/fl/sarasota/inbox/sarasota_county_export.csv \
  --output-dir /Users/lawainmcneil/Documents/New\ project/data/prospects/fl/sarasota/output
```

## Output

The generated files will land in:

- [output](/Users/lawainmcneil/Documents/New%20project/data/prospects/fl/sarasota/output)

## Official County Source

The Sarasota County Property Appraiser site currently shows:

- `Real Property Search`
- `Advanced Search`
- `Map Property Search`
- a `Download Data` section in the site navigation
- a `Records Request` contact

Official pages:

- [Sarasota County Property Appraiser home](https://www.sc-pa.com/home/)
- [Sarasota Property Search](https://www.sc-pa.com/propertysearch/)
- [Sarasota Contact / Records Request](https://www.sc-pa.com/contact-us/)

Current records request details visible on the official site:

- email: `PA@SarasotaPropertyAppraiser.gov` or `PA@sc-pa.com`
- phone: `941-861-8200`
- address: `2001 Adams Lane, Sarasota, FL 34237`

Inference from those pages:

- live public property search is available now
- the best compliant bulk workflow is still to use Sarasota's download/request path for a county export
- once you have the CSV, drop it into `inbox` and run the command above

## Demo Output

There is also a sample run in:

- [demo_output](/Users/lawainmcneil/Documents/New%20project/data/prospects/fl/sarasota/demo_output)

That demo is based on the local sample file, not a real county export.
