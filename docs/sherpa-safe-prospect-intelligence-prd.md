# SHERPA Safe Prospect Intelligence PRD

## Product Intent

Build a compliant, advisor-facing prospect intelligence workflow that uses public property records to identify households that may have planning needs around long-term care, estate liquidity, legacy planning, and concentrated real-estate wealth.

The workflow should help an advisor answer:

- Which households appear most planning-relevant in a target county or metro?
- Why were those records tagged?
- What public source supports each record?
- Which prospects should be reviewed manually before any outreach?

## Guardrail Positioning

This is not a background-report product and not a consumer-report substitute.

It should not be used for:

- housing eligibility
- employment screening
- insurance underwriting
- credit eligibility
- adverse-action decisions

It should not ingest:

- phone append data
- email append data
- criminal history
- credit attributes
- medical or claims data
- DMV or driver-license data

## Approved Data Types

- county assessor / property appraiser parcel exports
- county recorder deed or transfer records
- secretary of state business-entity ownership records
- county probate / trust signals when explicitly public and relevant
- SHERPA market scores derived from public demographic or tax data

## Data Model

### Core Prospect Fields

- prospect ID
- owner name
- parcel ID
- property address
- mailing address
- county
- state
- ZIP
- assessed value
- ownership tenure
- ownership type
- planning tags
- planning reasons
- provenance

### Compliance Fields

- source system
- source URL
- collection date
- permitted-use note
- review status
- outreach suppression status

## Scoring Principles

Scores should be explainable and rule-based.

High-signal example tags:

- trust-owned
- entity-owned
- multi-parcel-owner
- absentee-owner
- high-property-value
- long-tenure-owner
- county-LTC-priority
- legacy-planning-likely

Each score must be decomposable into visible reasons so an advisor can understand why a record surfaced.

## Workflow

1. Load county parcel exports.
2. Reject disallowed/sensitive columns.
3. Normalize owner, parcel, address, value, and tenure fields.
4. Add safe planning tags.
5. Blend optional county LTC market scores.
6. Produce registry, audit, and summary outputs.
7. Require manual review before outreach.

## Compliance Controls

- No sale or repackaging as a background-report product.
- No automated outreach list generation from third-party phone append sources.
- Separate suppression handling before any call campaign.
- Separate legal review before using any California data-broker-like workflow at scale.
- Provenance retained on every surfaced record.

## MVP Deliverables

- Public-record ingestion script
- Sample input template
- Audit-friendly output files
- Playbook documenting permitted use and exclusions
