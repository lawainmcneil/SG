# Stahlnecker Website Prototype

A static Stahlnecker Group homepage prototype inspired by the editorial structure, service presentation, and conversion flow of Carson Wealth.

## Run

Open `index.html` in a browser for the rebuilt Stahlnecker Group website.

Open `ffd-intake-form.html` in a browser for the Financial Fire Drill intake form.

Open `efs-carecapital-shield.html` in a browser for the Enhanced Funding Solutions CareCapital Shield version.

Open `efs-intake-form.html` in a browser for the Enhanced Funding Solutions intake form.

Open `sherpa-axis.html` in a browser for the SHERPA Axis portfolio analyzer and retirement income planning prototype.

Open `sherpa-intake.html` in a browser for the standalone SHERPA Axis client intake form.

Open `sherpa-ltc-analyzer.html` in a browser for the SHERPA LTC Analyzer, combining Florida opportunity scoring with a client-facing long-term care impact model.

Run `fetch_ltc_zip_public_data.py --help` to build Chicago and Baltimore ZIP concentration data from IRS SOI ZIP files plus the HUD ZIP-county crosswalk.

Run `build_safe_prospect_registry.py --help` to build a public-record-only prospect registry with transparent planning tags, provenance, and compliance guardrails.

Open `docs/sherpa-pa-county-prospect-playbook.md` for the Pennsylvania county rollout starter covering Northumberland, Lycoming, Montour, and Union.

Open `docs/sherpa-florida-county-prospect-playbook.md` for the Florida county rollout starter covering Sarasota and Martin.

Open `trout-brain.html` in a browser for the Trout Brain catch probability and conditions model.

The standalone tool pages use Tailwind CSS and Chart.js from CDNs, with state cost data embedded in `data.js`. The intake forms use Tailwind CSS from the CDN and are print-friendly standalone pages.
