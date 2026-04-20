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

const countyData = [...SHERPA_LTC_COUNTY_DATA].sort((a, b) => b.score - a.score);
const zipData = [...SHERPA_LTC_ZIP_DATA].sort((a, b) => b.score - a.score);

const elements = {
  countySelect: document.querySelector("#countySelect"),
  zipSearch: document.querySelector("#zipSearch"),
  countyTable: document.querySelector("#countyTable"),
  zipTable: document.querySelector("#zipTable"),
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

const getCountyTier = (score) => {
  if (score >= 60) return "High-priority county";
  if (score >= 35) return "Phase-two county";
  if (score >= 20) return "Monitor and enrich";
  return "Foundational county";
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
  const countyTier = getCountyTier(selectedCounty.score);

  notes.push(`${selectedCounty.county} screens as ${countyTier.toLowerCase()} with a Florida county opportunity score of ${selectedCounty.score.toFixed(1)}.`);
  notes.push(`The illustrated care event begins around age ${model.claimAge.toFixed(0)} and overlaps with ${money.format(model.incomeReserveNeed)} of household income need across the modeled care duration.`);
  notes.push(`${selectedCounty.county} shows ${money.format(selectedCounty.agiPerReturn)} AGI per return, ${selectedCounty.age65PlusPct.toFixed(1)}% age 65+, and ${selectedCounty.ownerOccupiedPct.toFixed(1)}% owner occupancy.`);
  notes.push(`ZIP ${selectedZip.zip} adds a sharper affluent screen at ${selectedZip.score.toFixed(1)} with ${money.format(selectedZip.agiPerReturn)} AGI per return.`);

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
  const countyIsPriority = PHASE_TWO_COUNTIES.includes(selectedCounty.county);

  if (countyIsPriority) {
    items.push(`${selectedCounty.county} is already in the phase-two county list, so parcel-owner enrichment is a practical next move.`);
  } else {
    items.push(`Keep ${selectedCounty.county} in a monitor lane unless advisor distribution, referral density, or local trigger events justify deeper enrichment.`);
  }

  if (model.selfFundDrag >= 0.35) {
    items.push("Lead with balance-sheet protection language rather than insurance language; the modeled care exposure is large enough to reframe the conversation.");
  } else {
    items.push("Use the analyzer as a preparedness conversation starter, then validate whether protection motivation or estate coordination is the stronger angle.");
  }

  if (selectedCounty.score >= 50) {
    items.push("Pair county opportunity with the top local ZIP screens to tighten seminar, mailer, or COI targeting.");
  } else {
    items.push("Use county-level messaging broadly, then refine outreach only when ZIP or parcel signals confirm visible wealth concentration.");
  }

  items.push("Cross-check trusts, multi-property ownership, entity ownership, and out-of-state mailing patterns before promoting a record into high-priority outreach.");
  return items;
};

const renderCountyDetail = () => {
  elements.countyName.textContent = `${selectedCounty.county} County`;
  elements.countyTier.textContent = getCountyTier(selectedCounty.score);
  elements.countyNarrative.textContent = `${selectedCounty.county} combines a ${selectedCounty.score.toFixed(1)} opportunity score with ${money.format(selectedCounty.agiPerReturn)} AGI per return and ${selectedCounty.age65PlusPct.toFixed(1)}% of residents age 65+, which makes it a strong SHERPA market context for balance-sheet protection conversations.`;
  elements.countyStats.innerHTML = `
    <div class="stat-tile"><span>Score</span><strong>${selectedCounty.score.toFixed(1)}</strong></div>
    <div class="stat-tile"><span>AGI / return</span><strong>${money.format(selectedCounty.agiPerReturn)}</strong></div>
    <div class="stat-tile"><span>Dividend / return</span><strong>${money.format(selectedCounty.dividendsPerReturn)}</strong></div>
    <div class="stat-tile"><span>65+ share</span><strong>${selectedCounty.age65PlusPct.toFixed(1)}%</strong></div>
  `;
};

const renderZipDetail = () => {
  elements.zipHeadline.textContent = `ZIP ${selectedZip.zip}`;
  elements.zipNarrative.textContent = `This ZIP screens at ${selectedZip.score.toFixed(1)} with ${money.format(selectedZip.agiPerReturn)} AGI per return, ${money.format(selectedZip.interestPerReturn)} taxable interest per return, and ${whole.format(selectedZip.returns)} returns in the 2022 IRS sample.`;
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
        backgroundColor: topCounties.map((row) => row.county === selectedCounty.county ? "#c69d52" : "#235d57"),
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

const populateCountySelect = () => {
  elements.countySelect.innerHTML = countyData.map((row) => `
    <option value="${row.county}" ${row.county === selectedCounty.county ? "selected" : ""}>${row.county}</option>
  `).join("");
};

const wireEvents = () => {
  elements.countySelect.addEventListener("change", () => {
    selectedCounty = countyData.find((row) => row.county === elements.countySelect.value) || countyData[0];
    renderMarket();
  });

  elements.zipSearch.addEventListener("input", renderTables);

  document.addEventListener("click", (event) => {
    const countyButton = event.target.closest("[data-county]");
    const zipButton = event.target.closest("[data-zip]");

    if (countyButton) {
      selectedCounty = countyData.find((row) => row.county === countyButton.dataset.county) || selectedCounty;
      elements.countySelect.value = selectedCounty.county;
      renderMarket();
    }

    if (zipButton) {
      selectedZip = zipData.find((row) => row.zip === zipButton.dataset.zip) || selectedZip;
      renderMarket();
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
  elements.topCountyMetric.textContent = countyData[0].county;
  elements.topCountyScore.textContent = `${countyData[0].score.toFixed(1)} score`;
  elements.topZipMetric.textContent = zipData[0].zip;
  elements.topZipScore.textContent = `${zipData[0].score.toFixed(1)} score`;
  elements.focusCounties.textContent = PHASE_TWO_COUNTIES.join(" • ");

  renderCountyDetail();
  renderZipDetail();
  renderTables();
  drawCountyChart();
  drawZipChart();
};

populateCountySelect();
wireEvents();
renderMarket();
renderScenario();
