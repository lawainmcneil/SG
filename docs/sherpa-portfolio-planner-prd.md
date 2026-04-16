# SHERPA Axis PRD

## 1. Product Overview

### Product Name
SHERPA Axis

### Product Type
Single-page financial planning web application built with HTML, Tailwind CSS, vanilla JavaScript, and Chart.js.

### Positioning
SHERPA Axis is a lightweight advisor-facing planning tool that turns retirement income complexity into a clear, visual client conversation. It combines portfolio analysis, bucket-based retirement income planning, RISA-style preference mapping, withdrawal sequencing, tax-aware projections, and client-ready charts in one responsive page.

### Core Promise
Help financial advisors quickly answer:

- Is the client on track?
- Which retirement income style fits the client?
- How should assets be bucketed across short-, mid-, and long-term needs?
- What risks threaten the plan?
- Which planning actions should be discussed next?

### Product Principles

- **Simple first, powerful underneath:** Start with a guided workflow and reveal advanced inputs only when useful.
- **Visual over spreadsheet:** Use dashboards, charts, flows, and client-readable language.
- **Advisor-led:** The app supports professional judgment; it does not replace advice.
- **Single-page, portable, fast:** No build pipeline is required for the MVP.
- **Educational and illustrative:** All calculations must be labeled as planning estimates, not guarantees.

## 2. Target Users

### Primary User
Independent financial advisors, insurance professionals, retirement income specialists, and estate/wealth planning teams who need a fast way to frame retirement income strategies for clients.

### Secondary Users
Clients and prospects reviewing a planning scenario with their advisor during a meeting.

### User Jobs

- Collect enough client data to build a first-pass retirement income picture.
- Analyze asset allocation and tax bucket distribution.
- Map client preferences to a retirement income style.
- Build and compare retirement income scenarios.
- Explain tradeoffs using simple visuals.
- Produce a concise action plan for follow-up planning.

## 3. Brand & Design Direction

### SHERPA Theme
The SHERPA brand should feel like a calm mountain guide: steady, clear, expert, and reassuring.

### Visual Personality

- Alpine guidance, route planning, elevation, summit progress, preparedness.
- Clean advisor dashboard, not consumer fintech gamification.
- Confident and grounded, with enough polish for client-facing use.

### Suggested Palette

- Summit Ink: `#17201F`
- Alpine Pine: `#1F5F4A`
- Glacier Blue: `#D9EEF2`
- Snowfield: `#F7F8F4`
- Trail Gold: `#C99A2E`
- Rock Gray: `#6B7280`
- Signal Red: `#B42318`

### UI Style

- Tailwind-driven layout.
- Responsive desktop-first advisor workspace with mobile-friendly stacking.
- Sticky navigation for major modules.
- Cards only for discrete repeated items and output panels.
- Charts should use restrained, distinct colors and readable labels.
- Copy should be client-friendly and avoid jargon where possible.

## 4. MVP Scope

The MVP is a single-page application with local in-browser calculations and no backend.

### Included in MVP

- Guided client intake.
- Portfolio inventory and tax bucket summary.
- RISA-style retirement income preference assessment.
- Bucket strategy builder.
- Retirement cash flow projection.
- Withdrawal sequencing estimate.
- Basic tax assumptions by retirement phase.
- RMD estimate.
- Roth conversion opportunity estimate.
- Monte Carlo-style simulation using user-defined return and volatility assumptions.
- Chart.js visual dashboard.
- Client-ready summary and action checklist.
- Print-friendly output.

### Excluded from MVP

- Account login.
- Custodian integrations.
- Tax return upload.
- Real historical market backtesting.
- Live Social Security optimization API.
- Estate document vault.
- Multi-user advisor/client portal.
- Compliance archive system.
- Native mobile apps.
- Real-time tax jurisdiction engine.

## 5. Core Workflow

### Step 1: Client Profile
Advisor enters demographics, retirement timing, spending goal, inflation assumption, and planning horizon.

### Step 2: Income Sources
Advisor enters Social Security, pensions, annuities, employment income, rental income, and other guaranteed or semi-guaranteed sources.

### Step 3: Asset Inventory
Advisor enters balances by account type:

- Cash and bank reserves.
- Taxable brokerage.
- Traditional IRA.
- 401(k)/403(b)/qualified plan.
- Roth IRA/Roth 401(k).
- HSA.
- Annuity assets.
- Home equity or other property, if included for planning context.

### Step 4: Portfolio Assumptions
Advisor enters current allocation and projected return/volatility assumptions.

### Step 5: RISA-Style Preference Assessment
Client answers preference questions that score across two axes:

- Probability-based vs. safety-first orientation.
- Optionality/flexibility vs. commitment/guarantee orientation.

The result maps to one of four retirement income style zones:

- Total Return.
- Time Segmentation.
- Risk Wrap.
- Income Protection.

### Step 6: Bucket Strategy
Advisor defines:

- Bucket 1: Cash/reserve years and target return.
- Bucket 2: Income/stability years and target return.
- Bucket 3: Growth/legacy assets and target return.
- Refill rule.
- Guardrail threshold.

### Step 7: Projection & Analysis
The app generates:

- Annual retirement cash flow.
- Income gap or surplus.
- Asset drawdown.
- Tax bucket usage.
- RMD estimate.
- Roth conversion window estimate.
- Monte Carlo success probability.
- Bucket depletion and refill alerts.

### Step 8: Client Summary
The app presents:

- Plan status.
- Key risks.
- Recommended next actions.
- Discussion prompts for advisor/client review.

## 6. Functional Requirements

### 6.1 Client Intake

| Requirement | Description | Priority |
|---|---|---|
| Demographics | Client name, spouse name, ages, retirement ages, planning horizon | Must |
| Expenses | Monthly spending, annual spending, inflation, one-time expenses | Must |
| Income | Social Security, pension, annuity, other income, start ages, COLA | Must |
| Tax assumptions | Current rate, early retirement rate, later retirement rate | Must |
| Assets | Account balances by tax type and liquidity | Must |
| Risk profile | Basic risk tolerance and loss comfort questions | Should |
| Healthcare | Medicare/healthcare annual estimate and long-term care placeholder | Should |
| Debt | Mortgage and other debt summary | Could |
| Charitable goals | Annual giving and legacy intent | Could |

### 6.2 Portfolio Analyzer

The app must calculate:

- Total investable assets.
- Allocation by asset class.
- Allocation by tax treatment.
- Liquidity ratio.
- Concentration warning if any category exceeds a configurable threshold.
- Estimated portfolio return based on weighted assumptions.
- Estimated portfolio volatility based on weighted assumptions.

Charts:

- Asset allocation doughnut.
- Tax bucket bar chart.
- Portfolio risk/return comparison.

### 6.3 RISA-Style Preference Module

The app must include a short questionnaire with scoring logic.

Example scoring:

- Question answers range from `-2` to `+2`.
- Safety-first answers increase safety score.
- Market-based answers increase probability score.
- Flexibility answers increase optionality score.
- Guarantee answers increase commitment score.

Output:

- Primary retirement income style.
- Secondary style if scores are close.
- Plain-English explanation.
- Strategy implications.

Important note: RISA is a recognized conceptual retirement income framework, but the MVP should avoid claiming to be an official RISA instrument unless licensed or validated. Label it as "RISA-style preference mapping" unless formal rights and methodology are secured.

### 6.4 Bucket Strategy Planner

The app must support three planning buckets:

| Bucket | Purpose | Typical Range | Inputs |
|---|---|---|---|
| Cash Reserve | Spending stability and near-term withdrawals | 1-3 years | Balance, years, return |
| Income/Stability | Medium-term withdrawals and refill source | 3-7 years | Balance, return, volatility |
| Growth/Legacy | Long-term growth and inflation defense | 7+ years | Balance, return, volatility |

The app must calculate:

- Required cash reserve based on spending gap.
- Years of spending covered by each bucket.
- Refill warning when Bucket 1 falls below threshold.
- Estimated ending value by bucket.
- Suggested reallocation based on selected retirement income style.

### 6.5 Retirement Cash Flow Projection

The app must project annual:

- Spending need.
- Guaranteed income.
- Portfolio withdrawal need.
- Estimated taxes.
- Net cash flow.
- Ending portfolio balance.

The projection must support:

- Inflation-adjusted spending.
- Income start ages.
- COLA assumptions.
- User-defined return assumptions.
- Pre-retirement and post-retirement years.

### 6.6 Tax-Aware Planning

MVP tax calculations are simplified and assumption-driven.

The app must estimate:

- Taxable withdrawal amount.
- Ordinary income bucket withdrawals.
- Roth withdrawals.
- Taxable brokerage withdrawals.
- Approximate tax cost using user-entered tax rates.
- Roth conversion window between retirement and RMD age.
- RMD beginning age based on current U.S. planning convention.

The app should clearly state:

- Tax outputs are estimates.
- Tax law changes and client-specific deductions are not fully modeled.
- Advisor should verify with tax professional.

### 6.7 RMD Calculator

The app must estimate RMDs using a simplified divisor table embedded in JavaScript.

Inputs:

- Age.
- Traditional IRA/qualified balance.
- Expected return.

Outputs:

- Estimated first RMD year.
- Estimated RMD amount.
- Impact on tax rate assumption.

### 6.8 Roth Conversion Opportunity

The app must estimate a conversion opportunity if:

- Client is retired or near retired.
- Current/early retirement tax rate is lower than later tax rate.
- Traditional qualified assets are material.
- RMD age has not yet started.

Outputs:

- Suggested annual conversion range.
- Tax cost estimate.
- Years available before RMDs.
- Warning for Medicare IRMAA, ACA credits, and tax bracket coordination.

### 6.9 Monte Carlo-Style Simulation

The app must run a lightweight simulation in browser.

Inputs:

- Starting portfolio balance.
- Annual spending gap.
- Expected return.
- Volatility.
- Inflation.
- Planning horizon.
- Number of trials, default 500 or 1,000.

Outputs:

- Probability of not depleting assets.
- Median ending balance.
- 10th percentile ending balance.
- 90th percentile ending balance.
- Failure year distribution.

Note: The MVP simulation may use normally distributed random annual returns. Future versions can add fat-tail assumptions, historical return sequences, and regime modeling.

### 6.10 Visual Dashboard

Chart.js visualizations:

- Net worth projection line chart.
- Annual income gap bar chart.
- Asset allocation doughnut chart.
- Tax bucket stacked bar chart.
- Monte Carlo ending balance distribution.
- Bucket balance over time line chart.

Optional non-Chart.js visual:

- Simple Sankey-like cash flow visualization using HTML/CSS blocks and connector lines.

### 6.11 Action Plan

The app must generate dynamic advisor prompts such as:

- Review Roth conversion before RMD age.
- Increase cash reserve to cover target spending years.
- Consider guaranteed income if RISA-style result favors income protection.
- Rebalance if growth bucket is underfunded.
- Discuss long-term care exposure.
- Coordinate tax strategy with CPA.
- Update beneficiaries and estate documents.

## 7. Data Model

For the single-page MVP, app state can live in one JavaScript object.

```js
const sherpaPlan = {
  client: {
    name: "",
    spouseName: "",
    age: 62,
    spouseAge: 60,
    retirementAge: 67,
    spouseRetirementAge: 67,
    planningHorizon: 30
  },
  assumptions: {
    inflationRate: 0.03,
    currentTaxRate: 0.24,
    earlyRetirementTaxRate: 0.12,
    laterRetirementTaxRate: 0.22
  },
  income: [],
  expenses: [],
  assets: [],
  portfolio: {
    stockPercent: 60,
    bondPercent: 30,
    cashPercent: 10,
    expectedReturn: 0.055,
    volatility: 0.11
  },
  risa: {
    safetyScore: 0,
    probabilityScore: 0,
    optionalityScore: 0,
    commitmentScore: 0,
    style: ""
  },
  buckets: [],
  results: {}
};
```

## 8. Calculation Rules

### Annual Spending

```text
spending[year] = baseAnnualSpending * (1 + inflationRate) ^ year
```

### Income Gap

```text
incomeGap[year] = max(0, spending[year] + estimatedTaxes[year] - guaranteedIncome[year])
```

### Portfolio Balance

```text
endingBalance = (startingBalance - withdrawal) * (1 + annualReturn)
```

### Required Cash Bucket

```text
requiredCashBucket = annualIncomeGap * targetCashYears
```

### Weighted Portfolio Return

```text
weightedReturn = sum(assetClassWeight * assetClassExpectedReturn)
```

### Simplified Roth Conversion Opportunity

```text
conversionWindowYears = max(0, rmdStartAge - currentAge)
conversionCandidate = traditionalBalance / max(1, conversionWindowYears)
```

### Monte Carlo Success

```text
successRate = successfulTrials / totalTrials
```

## 9. UX Requirements

### Layout

Single page with anchored sections:

1. Summit Dashboard.
2. Client Base Camp.
3. Income & Spending Trail Map.
4. Portfolio Pack Check.
5. RISA Compass.
6. Bucket Route Builder.
7. Tax & Conversion Pass.
8. Monte Carlo Weather Report.
9. Advisor Action Plan.

### Interaction Pattern

- Inputs update results in near real time.
- Each module has a compact default state.
- Advanced assumptions are collapsible.
- Warnings are contextual and plain-English.
- Summary cards use green/yellow/red status language sparingly.

### Mobile Behavior

- Inputs stack into one column.
- Charts remain readable at mobile width.
- Navigation becomes horizontal scroll or compact jump menu.
- Tables convert into stacked cards where needed.

### Print Mode

Print output should include:

- Client name and scenario date.
- Key assumptions.
- Dashboard metrics.
- Charts.
- RISA-style result.
- Bucket strategy.
- Action plan.

Print output should hide:

- Navigation.
- Raw advanced controls.
- Debug or developer-only elements.

## 10. Compliance & Disclosures

The app must display disclosures:

- For educational and planning discussion purposes only.
- Not investment, tax, legal, or insurance advice.
- Projections are hypothetical and not guarantees.
- Monte Carlo results depend on assumptions and may not reflect real market behavior.
- Tax estimates require CPA or qualified tax professional review.
- RISA-style assessment is preference mapping unless formally validated/licensed.

Advisor-facing data handling note:

- MVP data is processed locally in the browser.
- No client data is transmitted unless future integrations are added.
- Future versions should add encryption, audit logs, role-based access, and retention policies.

## 11. Nonfunctional Requirements

### Technology

- HTML file for structure.
- Tailwind CSS via CDN for styling.
- Chart.js via CDN for charts.
- Vanilla JavaScript for logic.
- Optional separate `sherpa-data.js` and `sherpa-app.js` files if the project follows the existing repo pattern.

### Performance

- Initial page should load quickly on broadband and mobile networks.
- Calculations should complete in under 500ms for default inputs.
- Monte Carlo should support a trial count cap to avoid browser lag.

### Accessibility

- Form inputs must have labels.
- Charts must have text summaries.
- Color cannot be the only indicator of status.
- Keyboard navigation should work for all controls.
- Contrast should meet WCAG AA where practical.

### Browser Support

- Latest Chrome, Safari, Edge, and Firefox.
- Responsive support down to 360px width.

## 12. MVP Acceptance Criteria

The MVP is complete when:

- Advisor can enter client demographics, income, spending, assets, and assumptions.
- App calculates total assets, income gap, projected portfolio path, and tax bucket mix.
- App produces a RISA-style retirement income preference result.
- App builds a three-bucket strategy and displays bucket health.
- App estimates RMD and Roth conversion opportunity.
- App runs a browser-based Monte Carlo simulation.
- Dashboard charts update when assumptions change.
- Advisor action plan updates based on results.
- Page works as a single-page app without a backend.
- Page is usable on desktop and mobile.
- Print view produces a client-ready planning summary.

## 13. Future Roadmap

### Phase 2: Better Planning Engine

- Historical return backtesting.
- Guardrails-based withdrawal rules.
- Social Security claiming comparison.
- Medicare and IRMAA estimates.
- More detailed federal tax bracket modeling.
- Scenario comparison: base, conservative, aggressive, guaranteed income.

### Phase 3: Advisor Workflow

- Save/load scenarios as JSON.
- Export PDF.
- Client intake link.
- Advisor notes.
- Household comparison.
- Task checklist.

### Phase 4: Integrations

- Tax return import.
- Custodian/account aggregation.
- CRM integration.
- e-signature/document vault.
- Compliance archive.

### Phase 5: Advanced Planning Modules

- Estate flow diagrams.
- Beneficiary tracking.
- Trust scenario modeling.
- Charitable giving strategies.
- Multi-currency planning.
- Expat and cross-border tax partner integrations.

## 14. Risks & Open Questions

| Risk | Impact | Mitigation |
|---|---|---|
| RISA licensing/validation | Misrepresentation risk | Use "RISA-style" language unless licensed |
| Tax simplification | Incorrect client expectations | Prominent disclosures and conservative labels |
| Monte Carlo assumptions | False precision | Explain assumptions and show ranges |
| Single-page complexity | UI clutter | Progressive disclosure and section navigation |
| No persistence | Limited advisor workflow | Add JSON export/import in Phase 2 |
| Compliance requirements | Advisor adoption barrier | Add audit/export features in later phase |

## 15. Recommended MVP Build Files

To match the existing project pattern:

- `sherpa-axis.html` for the single-page UI.
- `sherpa-app.js` for state, calculations, events, and charts.
- `sherpa-data.js` for RMD divisors, sample assumptions, and question sets.

## 16. Suggested Default Scenario

Use a realistic default household so the app is useful immediately on load:

- Client age: 62.
- Retirement age: 67.
- Annual spending goal: `$96,000`.
- Social Security: `$38,000` starting at 67.
- Pension/annuity income: `$12,000`.
- Taxable assets: `$350,000`.
- Traditional assets: `$900,000`.
- Roth assets: `$150,000`.
- Cash: `$75,000`.
- Inflation: `3%`.
- Portfolio return: `5.5%`.
- Volatility: `11%`.
- Planning horizon: `30 years`.

## 17. Success Metrics

### Advisor Experience

- Advisor can complete a first-pass scenario in under 10 minutes.
- Advisor can explain the result to a client without opening a spreadsheet.
- Advisor can identify at least three planning actions from the generated summary.

### Product Quality

- No calculation errors for default scenario.
- No chart rendering errors at desktop or mobile sizes.
- Print output fits into a clean client summary.
- All required disclosures are visible.

### Client Conversation

- Client understands their income gap.
- Client sees why bucket strategy matters.
- Client can identify their retirement income style.
- Client leaves with a clear next-step list.
