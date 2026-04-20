const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

const CARE_COSTS = {
  FL: {
    label: "Florida 2025 medians",
    assisted_living: 66000,
    home_care: 73216,
    nursing_home_semiprivate: 124100,
    nursing_home_private: 146000
  },
  USA: {
    label: "USA 2025 medians",
    assisted_living: 74400,
    home_care: 80080,
    nursing_home_semiprivate: 114975,
    nursing_home_private: 129575
  }
};

const CARE_LABELS = {
  assisted_living: "Assisted living",
  home_care: "Home care",
  nursing_home_semiprivate: "Nursing home semi-private",
  nursing_home_private: "Nursing home private"
};

const PHASE_TWO_COUNTIES = ["Sarasota", "Martin", "Palm Beach", "Collier", "Lee"];
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const EXPANSION_MARKETS = [
  {
    id: "greater-baltimore",
    name: "Greater Baltimore",
    state: "Maryland",
    type: "Metro expansion market",
    readiness: "COI + advisor outreach",
    focus: "Affluent suburban households, business-owner planning, and legacy-sensitive retirees across the Baltimore corridor.",
    footprint: "Baltimore metro footprint",
    play: "Lead with estate coordination, asset protection framing, and balance-sheet preservation instead of product-first LTC language."
  },
  {
    id: "greater-chicago",
    name: "Greater Chicago",
    state: "Illinois",
    type: "Metro expansion market",
    readiness: "Centers of influence + segmented campaigns",
    focus: "Higher-net-worth professionals, business owners, and multigenerational households who respond to tax-aware and asset-preservation framing.",
    footprint: "Chicago metro footprint",
    play: "Use segmented advisor and CPA channels, then localize the conversation around self-funding drag and family liquidity pressure."
  },
  {
    id: "northumberland",
    name: "Northumberland County",
    state: "Pennsylvania",
    type: "County expansion market",
    readiness: "County-level enrichment",
    focus: "Retiree and family-held asset conversations that may benefit from estate execution and protection planning.",
    footprint: "Northumberland County, PA",
    play: "Build a county parcel-owner layer first, then pair local outreach with the care-impact scenario to create urgency."
  },
  {
    id: "lycoming",
    name: "Lycoming County",
    state: "Pennsylvania",
    type: "County expansion market",
    readiness: "County-level enrichment",
    focus: "A practical secondary Pennsylvania target for households where land, business, and retirement assets need protection from care-event drag.",
    footprint: "Lycoming County, PA",
    play: "Prioritize COIs and estate-planning partners, then enrich visible wealth proxies before broad outbound activity."
  },
  {
    id: "montour",
    name: "Montour County",
    state: "Pennsylvania",
    type: "County expansion market",
    readiness: "Targeted local testing",
    focus: "A compact county market suitable for high-touch outreach and local referral testing before larger scale expansion.",
    footprint: "Montour County, PA",
    play: "Use a small-market pilot approach with trusted local introductions and a strong balance-sheet protection story."
  },
  {
    id: "union",
    name: "Union County",
    state: "Pennsylvania",
    type: "County expansion market",
    readiness: "Targeted local testing",
    focus: "A smaller Pennsylvania county where advisor-led relationship prospecting can be tested with lower noise and tighter local positioning.",
    footprint: "Union County, PA",
    play: "Treat this as a focused pilot county and validate response through attorney, CPA, and community-based channels."
  }
];

const countyData = [...SHERPA_LTC_COUNTY_DATA].sort((a, b) => b.score - a.score);
const zipData = [...SHERPA_LTC_ZIP_DATA].sort((a, b) => b.score - a.score);
const getCountyTier = (score) => {
  if (score >= 60) return "High-priority county";
  if (score >= 35) return "Phase-two county";
  if (score >= 20) return "Monitor and enrich";
  return "Foundational county";
};
const FLORIDA_MARKETS = countyData.map((row) => ({
  id: `florida-${slugify(row.county)}`,
  name: `${row.county} County`,
  shortName: row.county,
  state: "Florida",
  type: "Scored county market",
  readiness: getCountyTier(row.score),
  focus: `${row.county} is part of the scored Florida model and can be prioritized using visible wealth concentration, age mix, and owner-occupied stability.`,
  footprint: `${row.county} County, FL`,
  play: "Use the scored county and ZIP data together, then move into parcel-owner enrichment and advisor outreach.",
  scored: true,
  countyKey: row.county
}));
const ALL_MARKETS = [
  ...FLORIDA_MARKETS,
  ...EXPANSION_MARKETS.map((market) => ({ ...market, shortName: market.name, scored: false }))
];
const MARKET_STATES = ["Florida", "Illinois", "Maryland", "Pennsylvania"].filter((state) => ALL_MARKETS.some((market) => market.state === state));

const elements = {
  stateSelect: document.querySelector("#stateSelect"),
  marketSelect: document.querySelector("#marketSelect"),
  zipSearch: document.querySelector("#zipSearch"),
  countyTable: document.querySelector("#countyTable"),
  zipTable: document.querySelector("#zipTable"),
  expansionTable: document.querySelector("#expansionTable"),
  countyName: document.querySelector("#countyName"),
  countyTier: document.querySelector("#countyTier"),
  countyNarrative: document.querySelector("#countyNarrative"),
  countyStats: document.querySelector("#countyStats"),
  zipHeadline: document.querySelector("#zipHeadline"),
  zipNarrative: document.querySelector("#zipNarrative"),
  topCountyMetric: document.querySelector("#topCountyMetric"),
  topCountyScore: document.querySelector("#topCountyScore"),
  topZipMetric: document.querySelector("#topZipMetric"),
  topZipScore: document.querySelector("#topZipScore"),
  focusCounties: document.querySelector("#focusCounties"),
  jurisdiction: document.querySelector("#jurisdiction"),
  careType: document.querySelector("#careType"),
  currentAge: document.querySelector("#currentAge"),
  yearsToCare: document.querySelector("#yearsToCare"),
  careDuration: document.querySelector("#careDuration"),
  inflationRate: document.querySelector("#inflationRate"),
  assets: document.querySelector("#assets"),
  annualIncomeNeed: document.querySelector("#annualIncomeNeed"),
  portfolioReturn: document.querySelector("#portfolioReturn"),
  traditionalPremium: document.querySelector("#traditionalPremium"),
  traditionalCoverage: document.querySelector("#traditionalCoverage"),
  assetBasedPremium: document.querySelector("#assetBasedPremium"),
  assetPoolMultiple: document.querySelector("#assetPoolMultiple"),
  annualCareCost: document.querySelector("#annualCareCost"),
  totalCareExposure: document.querySelector("#totalCareExposure"),
  selfFundDrag: document.querySelector("#selfFundDrag"),
  assetPool: document.querySelector("#assetPool"),
  coverageMix: document.querySelector("#coverageMix"),
  scenarioRows: document.querySelector("#scenarioRows"),
  plannerNotes: document.querySelector("#plannerNotes"),
  actionList: document.querySelector("#actionList"),
  runAnalysis: document.querySelector("#runAnalysis"),
  printReport: document.querySelector("#printReport")
};

let selectedCounty = countyData.find((row) => row.county === "Sarasota") || countyData[0];
let selectedZip = zipData.find((row) => row.zip === "34228") || zipData[0];
let selectedState = "Florida";
let selectedMarket = FLORIDA_MARKETS.find((market) => market.shortName === "Sarasota") || FLORIDA_MARKETS[0];

let countyChart;
let zipChart;
let scenarioChart;
let fundingChart;

const numericValue = (element, fallback = 0) => {
  const value = Number(String(element.value).replace(/,/g, ""));
  return Number.isFinite(value) ? value : fallback;
};

const futureValue = (principal, ratePct, years) => principal * Math.pow(1 + ratePct / 100, years);
const inflate = (amount, inflationPct, years) => amount * Math.pow(1 + inflationPct / 100, years);

const totalInflatedCareCost = (annualCostAtClaim, inflationPct, durationYears) => {
  const fullYears = Math.floor(durationYears);
  const remainder = durationYears - fullYears;
  let total = 0;

  for (let year = 0; year < fullYears; year += 1) {
    total += annualCostAtClaim * Math.pow(1 + inflationPct / 100, year);
  }

  if (remainder > 0) {
    total += annualCostAtClaim * Math.pow(1 + inflationPct / 100, fullYears) * remainder;
  }

  return total;
};

const getInputs = () => ({
  jurisdiction: elements.jurisdiction.value,
  careType: elements.careType.value,
  currentAge: numericValue(elements.currentAge, 60),
  yearsToCare: numericValue(elements.yearsToCare, 10),
  careDuration: numericValue(elements.careDuration, 4),
  inflationRate: numericValue(elements.inflationRate, 3),
  assets: numericValue(elements.assets, 2000000),
  annualIncomeNeed: numericValue(elements.annualIncomeNeed, 90000),
  portfolioReturn: numericValue(elements.portfolioReturn, 5.5),
  traditionalPremium: numericValue(elements.traditionalPremium, 9000),
  traditionalCoverage: numericValue(elements.traditionalCoverage, 75) / 100,
  assetBasedPremium: numericValue(elements.assetBasedPremium, 150000),
  assetPoolMultiple: numericValue(elements.assetPoolMultiple, 3)
});

const scenarioModel = () => {
  const inputs = getInputs();
  const annualBaseCost = CARE_COSTS[inputs.jurisdiction][inputs.careType];
  const annualCareAtClaim = inflate(annualBaseCost, inputs.inflationRate, inputs.yearsToCare);
  const totalCareExposure = totalInflatedCareCost(annualCareAtClaim, inputs.inflationRate, inputs.careDuration);
  const portfolioAtClaim = futureValue(inputs.assets, inputs.portfolioReturn, inputs.yearsToCare);
  const claimAge = inputs.currentAge + inputs.yearsToCare;
  const incomeReserveNeed = inputs.annualIncomeNeed * inputs.careDuration;
  const opportunityCostTraditional = inputs.traditionalPremium * inputs.yearsToCare * (1 + inputs.portfolioReturn / 200);
  const traditionalBenefit = totalCareExposure * inputs.traditionalCoverage;
  const traditionalOutOfPocket = Math.max(totalCareExposure - traditionalBenefit, 0);
  const assetPool = inputs.assetBasedPremium * inputs.assetPoolMultiple;
  const assetBasedOutOfPocket = Math.max(totalCareExposure - assetPool, 0);

  const selfFund = {
    label: "Self-fund",
    preCarePortfolio: portfolioAtClaim,
    carePaidOutOfPocket: totalCareExposure,
    portfolioAfterCare: Math.max(portfolioAtClaim - totalCareExposure, 0)
  };

  const traditional = {
    label: "Traditional LTC",
    preCarePortfolio: Math.max(portfolioAtClaim - opportunityCostTraditional, 0),
    carePaidOutOfPocket: traditionalOutOfPocket,
    portfolioAfterCare: Math.max(portfolioAtClaim - opportunityCostTraditional - traditionalOutOfPocket, 0)
  };

  const assetBased = {
    label: "Asset-based LTC",
    preCarePortfolio: Math.max(portfolioAtClaim - inputs.assetBasedPremium, 0),
    carePaidOutOfPocket: assetBasedOutOfPocket,
    portfolioAfterCare: Math.max(portfolioAtClaim - inputs.assetBasedPremium - assetBasedOutOfPocket, 0),
    benefitPool: assetPool
  };

  const coverageRatio = totalCareExposure > 0 ? Math.min(assetPool / totalCareExposure, 1) : 0;
  const selfFundDrag = portfolioAtClaim > 0 ? totalCareExposure / portfolioAtClaim : 0;

  return {
    inputs,
    annualBaseCost,
    annualCareAtClaim,
    totalCareExposure,
    portfolioAtClaim,
    claimAge,
    incomeReserveNeed,
    assetPool,
    coverageRatio,
    selfFundDrag,
    scenarios: [selfFund, traditional, assetBased]
  };
};

const buildFundingSeries = (model) => {
  const years = [];
  const series = model.scenarios.map((scenario) => ({
    label: scenario.label,
    values: []
  }));

  let remaining = model.scenarios.map((scenario) => scenario.preCarePortfolio);
  const duration = Math.max(1, Math.ceil(model.inputs.careDuration));

  for (let year = 0; year <= duration; year += 1) {
    years.push(year === 0 ? "Claim" : `Care Y${year}`);
    series.forEach((entry, index) => entry.values.push(Math.max(remaining[index], 0)));

    if (year === duration) break;

    const annualDraw = model.annualCareAtClaim * Math.pow(1 + model.inputs.inflationRate / 100, year);
    remaining[0] -= annualDraw;
    remaining[1] -= annualDraw * (1 - model.inputs.traditionalCoverage);
    remaining[2] -= Math.max(annualDraw - model.assetPool / duration, 0);
  }

  return { years, series };
};

const getPlannerNotes = (model) => {
  const notes = [];
  if (selectedMarket.scored) {
    const countyTier = getCountyTier(selectedCounty.score);
    notes.push(`${selectedMarket.name} screens as ${countyTier.toLowerCase()} with a Florida county opportunity score of ${selectedCounty.score.toFixed(1)}.`);
    notes.push(`${selectedMarket.name} shows ${money.format(selectedCounty.agiPerReturn)} AGI per return, ${selectedCounty.age65PlusPct.toFixed(1)}% age 65+, and ${selectedCounty.ownerOccupiedPct.toFixed(1)}% owner occupancy.`);
    notes.push(`ZIP ${selectedZip.zip} adds a sharper affluent screen at ${selectedZip.score.toFixed(1)} with ${money.format(selectedZip.agiPerReturn)} AGI per return.`);
  } else {
    notes.push(`${selectedMarket.name}, ${selectedMarket.state} is currently an expansion market on the SHERPA watchlist with a ${selectedMarket.readiness.toLowerCase()} motion.`);
    notes.push(`${selectedMarket.focus}`);
    notes.push(`Recommended rollout play: ${selectedMarket.play}`);
  }
  notes.push(`The illustrated care event begins around age ${model.claimAge.toFixed(0)} and overlaps with ${money.format(model.incomeReserveNeed)} of household income need across the modeled care duration.`);

  if (model.selfFundDrag >= 0.35) {
    notes.push("The self-funding path creates material portfolio drag before taxes, market stress, or legal execution friction are layered in.");
  } else {
    notes.push("The modeled care event is still absorbable, but it meaningfully competes with retirement income flexibility and legacy intent.");
  }

  if (model.coverageRatio >= 1) {
    notes.push("The asset-based structure fully covers the modeled care exposure under these educational assumptions.");
  } else if (model.coverageRatio >= 0.6) {
    notes.push("The asset-based structure covers most of the modeled care event and meaningfully compresses out-of-pocket balance-sheet damage.");
  } else {
    notes.push("The current asset-based funding amount helps, but it still leaves a meaningful uncovered care gap that may warrant a larger repositioned asset base.");
  }

  return notes;
};

const getActionItems = (model) => {
  const items = [];
  const countyIsPriority = selectedMarket.scored && PHASE_TWO_COUNTIES.includes(selectedCounty.county);

  if (countyIsPriority) {
    items.push(`${selectedMarket.name} is already in the phase-two county list, so parcel-owner enrichment is a practical next move.`);
  } else if (selectedMarket.scored) {
    items.push(`Keep ${selectedMarket.name} in a monitor lane unless advisor distribution, referral density, or local trigger events justify deeper enrichment.`);
  } else {
    items.push(`Use ${selectedMarket.name} as an expansion market with a ${selectedMarket.readiness.toLowerCase()} motion before investing in full county scoring work.`);
  }

  if (model.selfFundDrag >= 0.35) {
    items.push("Lead with balance-sheet protection language rather than insurance language; the modeled care exposure is large enough to reframe the conversation.");
  } else {
    items.push("Use the analyzer as a preparedness conversation starter, then validate whether protection motivation or estate coordination is the stronger angle.");
  }

  if (selectedMarket.scored && selectedCounty.score >= 50) {
    items.push("Pair county opportunity with the top local ZIP screens to tighten seminar, mailer, or COI targeting.");
  } else if (selectedMarket.scored) {
    items.push("Use county-level messaging broadly, then refine outreach only when ZIP or parcel signals confirm visible wealth concentration.");
  } else {
    items.push("Build the local county or metro dataset next, then bring it into the same scored workflow the Florida counties already use.");
  }

  items.push(`For ${selectedMarket.name}, start with ${selectedMarket.readiness.toLowerCase()} and use this play: ${selectedMarket.play}`);
  items.push("Cross-check trusts, multi-property ownership, entity ownership, and out-of-state mailing patterns before promoting a record into high-priority outreach.");
  return items;
};

const renderCountyDetail = () => {
  elements.countyName.textContent = `${selectedMarket.name}, ${selectedMarket.state}`;
  if (selectedMarket.scored) {
    elements.countyTier.textContent = getCountyTier(selectedCounty.score);
    elements.countyNarrative.textContent = `${selectedMarket.name} combines a ${selectedCounty.score.toFixed(1)} opportunity score with ${money.format(selectedCounty.agiPerReturn)} AGI per return and ${selectedCounty.age65PlusPct.toFixed(1)}% of residents age 65+, which makes it a strong SHERPA market context for balance-sheet protection conversations.`;
    elements.countyStats.innerHTML = `
      <div class="stat-tile"><span>Score</span><strong>${selectedCounty.score.toFixed(1)}</strong></div>
      <div class="stat-tile"><span>AGI / return</span><strong>${money.format(selectedCounty.agiPerReturn)}</strong></div>
      <div class="stat-tile"><span>Dividend / return</span><strong>${money.format(selectedCounty.dividendsPerReturn)}</strong></div>
      <div class="stat-tile"><span>65+ share</span><strong>${selectedCounty.age65PlusPct.toFixed(1)}%</strong></div>
    `;
  } else {
    elements.countyTier.textContent = selectedMarket.type;
    elements.countyNarrative.textContent = `${selectedMarket.focus} This market is on the active SHERPA watchlist and is best approached through ${selectedMarket.readiness.toLowerCase()} before full local scoring is built.`;
    elements.countyStats.innerHTML = `
      <div class="stat-tile"><span>State</span><strong>${selectedMarket.state}</strong></div>
      <div class="stat-tile"><span>Readiness</span><strong>${selectedMarket.readiness}</strong></div>
      <div class="stat-tile"><span>Footprint</span><strong>${selectedMarket.footprint}</strong></div>
      <div class="stat-tile"><span>Role</span><strong>Expansion watchlist</strong></div>
    `;
  }
};

const renderZipDetail = () => {
  if (selectedMarket.scored) {
    elements.zipHeadline.textContent = `ZIP ${selectedZip.zip}`;
    elements.zipNarrative.textContent = `This ZIP screens at ${selectedZip.score.toFixed(1)} with ${money.format(selectedZip.agiPerReturn)} AGI per return, ${money.format(selectedZip.interestPerReturn)} taxable interest per return, and ${whole.format(selectedZip.returns)} returns in the 2022 IRS sample.`;
  } else {
    elements.zipHeadline.textContent = selectedMarket.state;
    elements.zipNarrative.textContent = "This market does not yet have a local ZIP concentration model inside the app. The next build step is a county- or metro-specific dataset so it can move into the same scored workflow as Florida.";
  }
};

const renderTables = () => {
  elements.countyTable.innerHTML = countyData.slice(0, 12).map((row) => `
    <button class="leader-row${row.county === selectedCounty.county ? " active" : ""}" data-county="${row.county}">
      <span>${row.county}</span>
      <span>${row.score.toFixed(1)}</span>
      <span>${money.format(row.agiPerReturn)}</span>
    </button>
  `).join("");

  const zipQuery = elements.zipSearch.value.trim();
  const filteredZips = zipQuery ? zipData.filter((row) => row.zip.includes(zipQuery)) : zipData.slice(0, 16);
  elements.zipTable.innerHTML = filteredZips.slice(0, 16).map((row) => `
    <button class="leader-row zip${row.zip === selectedZip.zip ? " active" : ""}" data-zip="${row.zip}">
      <span>${row.zip}</span>
      <span>${row.score.toFixed(1)}</span>
      <span>${money.format(row.agiPerReturn)}</span>
    </button>
  `).join("");

  elements.expansionTable.innerHTML = EXPANSION_MARKETS.map((market) => `
    <button class="leader-row${market.id === selectedMarket.id ? " active" : ""}" data-expansion="${market.id}">
      <span>${market.name}</span>
      <span>${market.state}</span>
      <span>${market.readiness}</span>
    </button>
  `).join("");
};

const drawCountyChart = () => {
  const topCounties = countyData.slice(0, 10);

  if (countyChart) countyChart.destroy();
  countyChart = new Chart(document.querySelector("#countyChart"), {
    type: "bar",
    data: {
      labels: topCounties.map((row) => row.county),
      datasets: [{
        label: "Opportunity score",
        data: topCounties.map((row) => row.score),
        backgroundColor: topCounties.map((row) => selectedMarket.scored && row.county === selectedCounty.county ? "#c69d52" : "#235d57"),
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (context) => `Score: ${context.parsed.y.toFixed(1)}` } }
      },
      scales: {
        x: {
          ticks: { color: "#d7e1de", maxRotation: 40, minRotation: 40 },
          grid: { display: false }
        },
        y: {
          ticks: { color: "#d7e1de" },
          grid: { color: "rgba(215,225,222,0.10)" }
        }
      }
    }
  });
};

const drawZipChart = () => {
  if (zipChart) zipChart.destroy();
  zipChart = new Chart(document.querySelector("#zipChart"), {
    type: "bubble",
    data: {
      datasets: [{
        label: "Top ZIP screens",
        data: zipData.slice(0, 40).map((row) => ({
          x: row.returns,
          y: row.agiPerReturn,
          r: Math.max(5, row.score / 2.6),
          zip: row.zip,
          score: row.score
        })),
        backgroundColor: "rgba(77, 164, 152, 0.45)",
        borderColor: "#7dd3c7",
        borderWidth: 1.2
      }, {
        label: "Selected ZIP",
        data: [{
          x: selectedZip.returns,
          y: selectedZip.agiPerReturn,
          r: Math.max(7, selectedZip.score / 2),
          zip: selectedZip.zip,
          score: selectedZip.score
        }],
        backgroundColor: "rgba(198, 157, 82, 0.72)",
        borderColor: "#f4d18d",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            title: (items) => `ZIP ${items[0].raw.zip}`,
            label: (context) => [
              `Score: ${context.raw.score.toFixed(1)}`,
              `AGI / return: ${money.format(context.raw.y)}`,
              `Returns: ${whole.format(context.raw.x)}`
            ]
          }
        },
        legend: { labels: { color: "#d7e1de" } }
      },
      scales: {
        x: {
          ticks: { color: "#d7e1de", callback: (value) => whole.format(value) },
          grid: { color: "rgba(215,225,222,0.08)" },
          title: { display: true, text: "IRS returns", color: "#d7e1de" }
        },
        y: {
          ticks: { color: "#d7e1de", callback: (value) => `$${Math.round(value / 1000)}k` },
          grid: { color: "rgba(215,225,222,0.08)" },
          title: { display: true, text: "AGI per return", color: "#d7e1de" }
        }
      }
    }
  });
};

const drawScenarioChart = (model) => {
  if (scenarioChart) scenarioChart.destroy();
  scenarioChart = new Chart(document.querySelector("#scenarioChart"), {
    type: "bar",
    data: {
      labels: model.scenarios.map((scenario) => scenario.label),
      datasets: [{
        label: "Portfolio after care",
        data: model.scenarios.map((scenario) => scenario.portfolioAfterCare),
        backgroundColor: ["#9f2f2f", "#4d8f8a", "#c69d52"],
        borderRadius: 12
      }, {
        label: "Out-of-pocket care",
        data: model.scenarios.map((scenario) => scenario.carePaidOutOfPocket),
        backgroundColor: ["rgba(159,47,47,0.35)", "rgba(77,143,138,0.35)", "rgba(198,157,82,0.35)"],
        borderRadius: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#213332" } },
        tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${money.format(context.parsed.y)}` } }
      },
      scales: {
        x: { ticks: { color: "#213332" }, grid: { display: false } },
        y: {
          ticks: { color: "#213332", callback: (value) => `$${Math.round(value / 1000)}k` },
          grid: { color: "rgba(33,51,50,0.08)" }
        }
      }
    }
  });
};

const drawFundingChart = (model) => {
  const series = buildFundingSeries(model);
  const colors = {
    "Self-fund": "#9f2f2f",
    "Traditional LTC": "#4d8f8a",
    "Asset-based LTC": "#c69d52"
  };

  if (fundingChart) fundingChart.destroy();
  fundingChart = new Chart(document.querySelector("#fundingChart"), {
    type: "line",
    data: {
      labels: series.years,
      datasets: series.series.map((entry) => ({
        label: entry.label,
        data: entry.values,
        borderColor: colors[entry.label],
        backgroundColor: `${colors[entry.label]}22`,
        tension: 0.28,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 5
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#213332" } },
        tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${money.format(context.parsed.y)}` } }
      },
      scales: {
        x: { ticks: { color: "#213332" }, grid: { color: "rgba(33,51,50,0.06)" } },
        y: {
          ticks: { color: "#213332", callback: (value) => `$${Math.round(value / 1000)}k` },
          grid: { color: "rgba(33,51,50,0.06)" }
        }
      }
    }
  });
};

const renderScenario = () => {
  const model = scenarioModel();
  const notes = getPlannerNotes(model);
  const actions = getActionItems(model);

  elements.annualCareCost.textContent = money.format(model.annualCareAtClaim);
  elements.totalCareExposure.textContent = money.format(model.totalCareExposure);
  elements.selfFundDrag.textContent = pct.format(model.selfFundDrag);
  elements.assetPool.textContent = money.format(model.assetPool);
  elements.coverageMix.textContent = `${pct.format(model.coverageRatio)} of the modeled care event is covered by the asset-based benefit pool.`;

  elements.scenarioRows.innerHTML = model.scenarios.map((scenario) => `
    <tr>
      <td>${scenario.label}</td>
      <td>${money.format(scenario.preCarePortfolio)}</td>
      <td>${money.format(scenario.carePaidOutOfPocket)}</td>
      <td>${money.format(scenario.portfolioAfterCare)}</td>
    </tr>
  `).join("");

  elements.plannerNotes.innerHTML = notes.map((note) => `<div class="note">${note}</div>`).join("");
  elements.actionList.innerHTML = actions.map((action) => `<li>${action}</li>`).join("");

  drawScenarioChart(model);
  drawFundingChart(model);
};

const populateStateSelect = () => {
  elements.stateSelect.innerHTML = MARKET_STATES.map((state) => `
    <option value="${state}" ${state === selectedState ? "selected" : ""}>${state}</option>
  `).join("");
};

const populateMarketSelect = () => {
  const stateMarkets = ALL_MARKETS.filter((market) => market.state === selectedState);
  if (!stateMarkets.some((market) => market.id === selectedMarket.id)) {
    selectedMarket = stateMarkets[0];
  }
  elements.marketSelect.innerHTML = stateMarkets.map((market) => `
    <option value="${market.id}" ${market.id === selectedMarket.id ? "selected" : ""}>${market.name}</option>
  `).join("");
};

const syncSelectedMarket = () => {
  if (selectedMarket.scored) {
    selectedCounty = countyData.find((row) => row.county === selectedMarket.countyKey) || selectedCounty;
  }
};

const wireEvents = () => {
  elements.stateSelect.addEventListener("change", () => {
    selectedState = elements.stateSelect.value;
    populateMarketSelect();
    syncSelectedMarket();
    renderMarket();
    renderScenario();
  });

  elements.marketSelect.addEventListener("change", () => {
    selectedMarket = ALL_MARKETS.find((market) => market.id === elements.marketSelect.value) || selectedMarket;
    syncSelectedMarket();
    renderMarket();
    renderScenario();
  });

  elements.zipSearch.addEventListener("input", renderTables);

  document.addEventListener("click", (event) => {
    const countyButton = event.target.closest("[data-county]");
    const zipButton = event.target.closest("[data-zip]");
    const expansionButton = event.target.closest("[data-expansion]");

    if (countyButton) {
      selectedCounty = countyData.find((row) => row.county === countyButton.dataset.county) || selectedCounty;
      selectedState = "Florida";
      selectedMarket = FLORIDA_MARKETS.find((market) => market.countyKey === selectedCounty.county) || selectedMarket;
      populateStateSelect();
      populateMarketSelect();
      renderMarket();
      renderScenario();
    }

    if (zipButton) {
      selectedZip = zipData.find((row) => row.zip === zipButton.dataset.zip) || selectedZip;
      renderMarket();
    }

    if (expansionButton) {
      selectedMarket = EXPANSION_MARKETS.find((market) => market.id === expansionButton.dataset.expansion) || selectedMarket;
      selectedState = selectedMarket.state;
      populateStateSelect();
      populateMarketSelect();
      renderMarket();
      renderScenario();
    }
  });

  [
    elements.jurisdiction,
    elements.careType,
    elements.currentAge,
    elements.yearsToCare,
    elements.careDuration,
    elements.inflationRate,
    elements.assets,
    elements.annualIncomeNeed,
    elements.portfolioReturn,
    elements.traditionalPremium,
    elements.traditionalCoverage,
    elements.assetBasedPremium,
    elements.assetPoolMultiple
  ].forEach((element) => {
    element.addEventListener("input", renderScenario);
    element.addEventListener("change", renderScenario);
  });

  elements.runAnalysis.addEventListener("click", renderScenario);
  elements.printReport.addEventListener("click", () => window.print());
};

const renderMarket = () => {
  elements.topCountyMetric.textContent = selectedState;
  elements.topCountyScore.textContent = `${ALL_MARKETS.filter((market) => market.state === selectedState).length} markets`;
  elements.topZipMetric.textContent = selectedMarket.name;
  elements.topZipScore.textContent = selectedMarket.scored ? `${selectedCounty.score.toFixed(1)} score` : selectedMarket.type;
  elements.focusCounties.textContent = [...PHASE_TWO_COUNTIES, "Greater Baltimore", "Greater Chicago", "Northumberland", "Lycoming", "Montour", "Union"].join(" • ");

  renderCountyDetail();
  renderZipDetail();
  renderTables();
  drawCountyChart();
  drawZipChart();
};

populateStateSelect();
populateMarketSelect();
syncSelectedMarket();
wireEvents();
renderMarket();
renderScenario();
