const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const modelColors = {
  "Fixed | Capital Preservation": "#6B7280",
  Income: "#C99A2E",
  Balanced: "#1F5F4A",
  Growth: "#2563EB",
  Aggressive: "#B42318"
};

const fields = {
  clientName: document.querySelector("#clientName"),
  spouseName: document.querySelector("#spouseName"),
  clientEmail: document.querySelector("#clientEmail"),
  clientState: document.querySelector("#clientState"),
  age: document.querySelector("#age"),
  retirementAge: document.querySelector("#retirementAge"),
  horizon: document.querySelector("#horizon"),
  legacyGoal: document.querySelector("#legacyGoal"),
  monthlyLifestyle: document.querySelector("#monthlyLifestyle"),
  healthcareAnnual: document.querySelector("#healthcareAnnual"),
  debtAnnual: document.querySelector("#debtAnnual"),
  givingAnnual: document.querySelector("#givingAnnual"),
  oneTimeGoals: document.querySelector("#oneTimeGoals"),
  spending: document.querySelector("#spending"),
  socialSecurity: document.querySelector("#socialSecurity"),
  pensionIncome: document.querySelector("#pensionIncome"),
  annuityIncome: document.querySelector("#annuityIncome"),
  otherIncome: document.querySelector("#otherIncome"),
  income: document.querySelector("#income"),
  inflation: document.querySelector("#inflation"),
  taxRate: document.querySelector("#taxRate"),
  cash: document.querySelector("#cash"),
  taxable: document.querySelector("#taxable"),
  traditional: document.querySelector("#traditional"),
  roth: document.querySelector("#roth"),
  marketComfort: document.querySelector("#marketComfort"),
  incomePreference: document.querySelector("#incomePreference"),
  downturnBehavior: document.querySelector("#downturnBehavior"),
  portfolioSelect: document.querySelector("#portfolioSelect"),
  stressPeriod: document.querySelector("#stressPeriod")
};

const output = {
  statusLabel: document.querySelector("#statusLabel"),
  successRate: document.querySelector("#successRate"),
  incomeGap: document.querySelector("#incomeGap"),
  risaStyle: document.querySelector("#risaStyle"),
  risaHeadline: document.querySelector("#risaHeadline"),
  risaCopy: document.querySelector("#risaCopy"),
  suggestedModel: document.querySelector("#suggestedModel"),
  cashYears: document.querySelector("#cashYears"),
  middleYears: document.querySelector("#middleYears"),
  portfolioDescription: document.querySelector("#portfolioDescription"),
  annReturn: document.querySelector("#annReturn"),
  annRisk: document.querySelector("#annRisk"),
  bestYear: document.querySelector("#bestYear"),
  worstYear: document.querySelector("#worstYear"),
  rangeSpread: document.querySelector("#rangeSpread"),
  rangeBar: document.querySelector("#rangeBar"),
  bucketOne: document.querySelector("#bucketOne"),
  bucketTwo: document.querySelector("#bucketTwo"),
  bucketThree: document.querySelector("#bucketThree"),
  backtestNarrative: document.querySelector("#backtestNarrative"),
  modelTable: document.querySelector("#modelTable"),
  actionsList: document.querySelector("#actionsList"),
  spendingBuild: document.querySelector("#spendingBuild"),
  incomeBuild: document.querySelector("#incomeBuild"),
  assetBuild: document.querySelector("#assetBuild"),
  intakeSummary: document.querySelector("#intakeSummary"),
  loadedClient: document.querySelector("#loadedClient"),
  risaAxis: document.querySelector("#risaAxis"),
  psScore: document.querySelector("#psScore"),
  ocScore: document.querySelector("#ocScore"),
  risaProducts: document.querySelector("#risaProducts"),
  risaStress: document.querySelector("#risaStress"),
  periodReturnGrid: document.querySelector("#periodReturnGrid"),
  stressNarrative: document.querySelector("#stressNarrative"),
  rothWindow: document.querySelector("#rothWindow"),
  firstRmd: document.querySelector("#firstRmd"),
  yearOneTax: document.querySelector("#yearOneTax"),
  taxableGap: document.querySelector("#taxableGap"),
  cashFlowTable: document.querySelector("#cashFlowTable")
};

let projectionChart;
let allocationChart;
let backtestChart;
let risaChart;
let riskReturnChart;
let stressChart;
let cashFlowChart;

const numberValue = (input, fallback = 0) => {
  if (!input) return fallback;
  const value = Number(String(input.value).replace(/,/g, ""));
  return Number.isFinite(value) ? value : fallback;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const portfolioByName = (name) => SHERPA_DFA_DATA.portfolios.find((portfolio) => portfolio.name === name || portfolio.shortName === name);

const setMoneyField = (input, value) => {
  if (!input) return;
  input.value = value ? whole.format(Math.round(value)) : "0";
};

const setFieldValue = (field, value) => {
  if (!field || value === null || value === undefined || value === "") return;
  field.value = value;
};

const applyIntakeFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  if (!params.size) return false;

  const passthroughFields = [
    "clientName",
    "spouseName",
    "clientEmail",
    "clientState",
    "age",
    "retirementAge",
    "horizon",
    "legacyGoal",
    "monthlyLifestyle",
    "healthcareAnnual",
    "debtAnnual",
    "givingAnnual",
    "oneTimeGoals",
    "socialSecurity",
    "pensionIncome",
    "annuityIncome",
    "otherIncome",
    "inflation",
    "taxRate",
    "cash",
    "taxable",
    "traditional",
    "roth",
    "marketComfort",
    "incomePreference",
    "downturnBehavior",
    "portfolioSelect"
  ];

  passthroughFields.forEach((key) => setFieldValue(fields[key], params.get(key)));
  return true;
};

const getIntakeTotals = () => {
  const horizon = clamp(numberValue(fields.horizon, 30), 1, 60);
  const annualSpending =
    numberValue(fields.monthlyLifestyle) * 12 +
    numberValue(fields.healthcareAnnual) +
    numberValue(fields.debtAnnual) +
    numberValue(fields.givingAnnual) +
    numberValue(fields.oneTimeGoals) / horizon;
  const guaranteedIncome =
    numberValue(fields.socialSecurity) +
    numberValue(fields.pensionIncome) +
    numberValue(fields.annuityIncome) +
    numberValue(fields.otherIncome);

  return {
    horizon,
    annualSpending,
    guaranteedIncome,
    legacyGoal: numberValue(fields.legacyGoal)
  };
};

const getRisaStyle = () => {
  const scores = getRisaScores();
  if (scores.ps >= 0 && scores.oc >= 0) return "Total Return";
  if (scores.ps < 0 && scores.oc >= 0) return "Time Segmentation";
  if (scores.ps < 0 && scores.oc < 0) return "Income Protection";
  return "Risk Wrap";
};

const getRisaScores = () => {
  const ps = clamp((Number(fields.marketComfort.value) + Number(fields.downturnBehavior.value)) / 2, -3, 3);
  const oc = clamp(Number(fields.incomePreference.value), -3, 3);
  return { ps, oc };
};

const getPlan = () => {
  const risaStyle = getRisaStyle();
  const risa = SHERPA_DFA_DATA.risaMap[risaStyle];
  const selectedPortfolio = portfolioByName(fields.portfolioSelect.value) || portfolioByName(risa.portfolio);
  const intake = getIntakeTotals();
  const assets = {
    cash: Math.max(0, numberValue(fields.cash)),
    taxable: Math.max(0, numberValue(fields.taxable)),
    traditional: Math.max(0, numberValue(fields.traditional)),
    roth: Math.max(0, numberValue(fields.roth))
  };
  const totalAssets = assets.cash + assets.taxable + assets.traditional + assets.roth;
  const annualSpending = Math.max(0, intake.annualSpending || numberValue(fields.spending));
  const guaranteedIncome = Math.max(0, intake.guaranteedIncome || numberValue(fields.income));
  const taxRate = Math.max(0, numberValue(fields.taxRate)) / 100;
  const grossGap = Math.max(0, annualSpending - guaranteedIncome);
  const taxDrag = grossGap * taxRate;
  const annualGap = grossGap + taxDrag;

  return {
    age: numberValue(fields.age, 62),
    retirementAge: numberValue(fields.retirementAge, 67),
    horizon: intake.horizon,
    inflation: Math.max(0, numberValue(fields.inflation, 3)) / 100,
    annualSpending,
    guaranteedIncome,
    taxRate,
    grossGap,
    annualGap,
    assets,
    totalAssets,
    legacyGoal: intake.legacyGoal,
    risaScores: getRisaScores(),
    risaStyle,
    risa,
    portfolio: selectedPortfolio
  };
};

const projectPlan = (plan) => {
  let balance = plan.totalAssets;
  const years = [];
  const balances = [];
  const gaps = [];

  for (let year = 0; year <= plan.horizon; year += 1) {
    const inflatedGap = plan.annualGap * Math.pow(1 + plan.inflation, year);
    if (year > 0) {
      balance = Math.max(0, (balance - inflatedGap) * (1 + plan.portfolio.annualizedReturn));
    }
    years.push(`Y${year}`);
    balances.push(Math.round(balance));
    gaps.push(Math.round(inflatedGap));
  }

  return { years, balances, gaps, endingBalance: balances[balances.length - 1] };
};

const estimateSuccess = (plan, projection) => {
  const withdrawalRate = plan.totalAssets > 0 ? plan.annualGap / plan.totalAssets : 1;
  const returnSpread = plan.portfolio.annualizedReturn - plan.inflation - withdrawalRate;
  const riskPenalty = plan.portfolio.standardDeviation * 0.9;
  const balanceBonus = projection.endingBalance > plan.totalAssets * 0.2 ? 0.12 : -0.08;
  return clamp(0.72 + returnSpread * 3 - riskPenalty + balanceBonus, 0.05, 0.98);
};

const getRmdFactor = (age) => {
  const table = { 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0 };
  return table[Math.min(85, Math.max(73, Math.round(age)))] || 26.5;
};

const getFirstRmd = (plan) => {
  const firstRmdAge = 73;
  const rmdYears = Math.max(0, firstRmdAge - plan.age);
  return plan.assets.traditional > 0 ? plan.assets.traditional * Math.pow(1 + plan.portfolio.annualizedReturn, rmdYears) / getRmdFactor(firstRmdAge) : 0;
};

const buildCashFlowRows = (plan) => {
  let balance = plan.totalAssets;
  let traditional = plan.assets.traditional;
  const rows = [];
  for (let year = 1; year <= Math.min(plan.horizon, 12); year += 1) {
    const age = plan.age + year;
    const spending = plan.annualSpending * Math.pow(1 + plan.inflation, year - 1);
    const income = plan.guaranteedIncome * Math.pow(1 + Math.min(plan.inflation, 0.025), year - 1);
    const grossWithdrawal = Math.max(0, spending - income);
    const tax = grossWithdrawal * plan.taxRate;
    const rmd = age >= 73 && traditional > 0 ? traditional / getRmdFactor(age) : 0;
    const withdrawal = grossWithdrawal + tax;
    balance = Math.max(0, (balance - withdrawal) * (1 + plan.portfolio.annualizedReturn));
    traditional = Math.max(0, (traditional - Math.max(rmd, grossWithdrawal * 0.7)) * (1 + plan.portfolio.annualizedReturn));
    rows.push({ year, age, spending, income, withdrawal, tax, rmd, balance });
  }
  return rows;
};

const getStressReturn = (portfolio, years) => {
  if (years === 3) return portfolio.lowThreeYear;
  if (years === 5) return portfolio.lowFiveYear;
  if (years === 10) return portfolio.lowTenYear;
  return portfolio.lowOneYear;
};

const getActions = (plan, projection, success) => {
  const actions = [];
  const firstRmdAge = 73;
  const rmdYears = Math.max(0, firstRmdAge - plan.age);
  const firstRmd = plan.assets.traditional > 0 ? plan.assets.traditional * Math.pow(1 + plan.portfolio.annualizedReturn, rmdYears) / getRmdFactor(firstRmdAge) : 0;
  const conversionWindow = Math.max(0, firstRmdAge - Math.max(plan.age, plan.retirementAge));
  const conversionCandidate = conversionWindow > 0 ? plan.assets.traditional / conversionWindow : 0;

  if (success < 0.8) actions.push(["Strengthen the route", "Reduce spending gap, delay retirement, increase guaranteed income, or choose a lower-volatility portfolio route."]);
  if (plan.assets.cash < plan.annualGap * plan.risa.bucketOneYears) actions.push(["Build Bucket 1", `Target ${money.format(plan.annualGap * plan.risa.bucketOneYears)} in short-term reserves for this income style.`]);
  if (conversionWindow > 0 && plan.assets.traditional > plan.assets.roth * 2) actions.push(["Review Roth conversion window", `Illustrative annual conversion capacity is about ${money.format(conversionCandidate)} before RMD age, subject to tax bracket and IRMAA review.`]);
  if (firstRmd > plan.annualGap * 0.5) actions.push(["Plan for RMD pressure", `Estimated first RMD is ${money.format(firstRmd)}, which may change later-year tax exposure.`]);
  if (plan.risaStyle === "Income Protection") actions.push(["Discuss durable income", "Consider whether a guaranteed-income sleeve improves confidence and behavior in downturns."]);
  if (plan.portfolio.lowOneYear < -0.18) actions.push(["Pre-wire downturn behavior", `This model's worst rolling 1-year period in the export was ${pct.format(plan.portfolio.lowOneYear)}. Agree on refill and rebalancing rules now.`]);
  if (plan.legacyGoal > 0 && projection.endingBalance < plan.legacyGoal) actions.push(["Protect legacy target", `Projected ending assets are below the desired ${money.format(plan.legacyGoal)} legacy goal. Review spending, allocation, gifting, and insurance assumptions.`]);
  actions.push(["Coordinate tax and estate", "Confirm beneficiary designations, estate documents, withdrawal order, and CPA review before implementation."]);
  return actions.slice(0, 6);
};

const renderProjectionChart = (projection, plan) => {
  const ctx = document.querySelector("#projectionChart");
  if (projectionChart) projectionChart.destroy();
  projectionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: projection.years,
      datasets: [
        { label: "Projected assets", data: projection.balances, borderColor: "#1F5F4A", backgroundColor: "rgba(31,95,74,.12)", fill: true, tension: 0.28 },
        { label: "Inflated income gap", data: projection.gaps, borderColor: "#C99A2E", backgroundColor: "rgba(201,154,46,.1)", tension: 0.28 }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: plan ? "#17201F" : "#fff" } } },
      scales: { y: { ticks: { callback: (value) => money.format(value) } } }
    }
  });
};

const renderAllocationChart = (portfolio) => {
  const ctx = document.querySelector("#allocationChart");
  if (allocationChart) allocationChart.destroy();
  allocationChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: portfolio.allocations.map((item) => item[0]),
      datasets: [{ data: portfolio.allocations.map((item) => item[1]), backgroundColor: ["#1F5F4A", "#C99A2E", "#D9EEF2", "#6B7280", "#2563EB", "#B42318"] }]
    },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } }
  });
};

const renderRisaChart = (plan) => {
  const ctx = document.querySelector("#risaChart");
  if (!ctx) return;
  if (risaChart) risaChart.destroy();
  risaChart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        { label: plan.risaStyle, data: [{ x: plan.risaScores.oc, y: plan.risaScores.ps }], pointRadius: 8, pointBackgroundColor: "#C99A2E" }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { min: -3, max: 3, title: { display: true, text: "Commitment ← → Optionality" }, grid: { color: (ctx) => ctx.tick.value === 0 ? "#17201F" : "rgba(23,32,31,.08)" } },
        y: { min: -3, max: 3, title: { display: true, text: "Safety-First ← → Probability-Based" }, grid: { color: (ctx) => ctx.tick.value === 0 ? "#17201F" : "rgba(23,32,31,.08)" } }
      }
    }
  });
};

const renderRiskReturnChart = () => {
  const ctx = document.querySelector("#riskReturnChart");
  if (!ctx) return;
  if (riskReturnChart) riskReturnChart.destroy();
  riskReturnChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: SHERPA_DFA_DATA.portfolios.map((portfolio) => portfolio.shortName),
      datasets: [
        { label: "Annualized return", data: SHERPA_DFA_DATA.portfolios.map((portfolio) => portfolio.annualizedReturn * 100), backgroundColor: "#1F5F4A" },
        { label: "Std. deviation", data: SHERPA_DFA_DATA.portfolios.map((portfolio) => portfolio.standardDeviation * 100), backgroundColor: "#C99A2E" }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: "bottom" } }, scales: { y: { ticks: { callback: (value) => `${value}%` } } } }
  });
};

const renderStressChart = (plan, requiredCash, requiredMiddle, longTermAssets) => {
  const ctx = document.querySelector("#stressChart");
  if (!ctx) return;
  if (stressChart) stressChart.destroy();
  const years = Number(fields.stressPeriod.value || 1);
  const stressReturn = getStressReturn(plan.portfolio, years);
  const stressedGrowth = longTermAssets * Math.pow(1 + stressReturn, years);
  stressChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Bucket 1", "Bucket 2", "Bucket 3"],
      datasets: [
        { label: "Current route", data: [requiredCash, requiredMiddle, longTermAssets], backgroundColor: "#1F5F4A" },
        { label: "After stress period", data: [Math.max(0, requiredCash - plan.annualGap * years), requiredMiddle, stressedGrowth], backgroundColor: "#C99A2E" }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: "bottom" } }, scales: { y: { ticks: { callback: (value) => money.format(value) } } } }
  });
};

const renderCashFlowChart = (rows) => {
  const ctx = document.querySelector("#cashFlowChart");
  if (!ctx) return;
  if (cashFlowChart) cashFlowChart.destroy();
  cashFlowChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: rows.map((row) => `Y${row.year}`),
      datasets: [
        { label: "Guaranteed income", data: rows.map((row) => row.income), backgroundColor: "#1F5F4A" },
        { label: "Portfolio withdrawal", data: rows.map((row) => row.withdrawal), backgroundColor: "#C99A2E" },
        { label: "Estimated tax", data: rows.map((row) => row.tax), backgroundColor: "#B42318" }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: "bottom" } }, scales: { y: { ticks: { callback: (value) => money.format(value) } } } }
  });
};

const renderBacktestChart = () => {
  const ctx = document.querySelector("#backtestChart");
  if (backtestChart) backtestChart.destroy();
  const labels = SHERPA_DFA_DATA.growthOfWealth.map((row) => row.date.replace("12/31/", "").replace("3/31/", "Q1 "));
  backtestChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: SHERPA_DFA_DATA.portfolios.map((portfolio) => ({
        label: portfolio.shortName,
        data: SHERPA_DFA_DATA.growthOfWealth.map((row) => row[portfolio.name]),
        borderColor: modelColors[portfolio.name],
        tension: 0.25
      }))
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
      scales: { y: { ticks: { callback: (value) => `$${Number(value).toFixed(1)}x` } } }
    }
  });
};

const renderModelTable = () => {
  output.modelTable.innerHTML = SHERPA_DFA_DATA.portfolios.map((portfolio) => `
    <tr>
      <td class="p-3 font-bold">${portfolio.shortName}</td>
      <td class="p-3">${pct.format(portfolio.annualizedReturn)}</td>
      <td class="p-3">${pct.format(portfolio.standardDeviation)}</td>
    </tr>
  `).join("");
};

const update = () => {
  const plan = getPlan();
  const projection = projectPlan(plan);
  const success = estimateSuccess(plan, projection);
  const requiredCash = plan.annualGap * plan.risa.bucketOneYears;
  const requiredMiddle = plan.annualGap * plan.risa.bucketTwoYears;
  const longTermAssets = Math.max(0, plan.totalAssets - requiredCash - requiredMiddle);
  const cashFlowRows = buildCashFlowRows(plan);
  const firstRmdAmount = getFirstRmd(plan);
  const rothWindowYears = Math.max(0, 73 - Math.max(plan.age, plan.retirementAge));
  const stressYears = Number(fields.stressPeriod.value || 1);
  const stressReturn = getStressReturn(plan.portfolio, stressYears);
  const requiredFields = [fields.clientName, fields.age, fields.retirementAge, fields.monthlyLifestyle, fields.socialSecurity, fields.cash, fields.taxable, fields.traditional, fields.roth];
  const completedFields = requiredFields.filter((field) => field && String(field.value).trim() !== "" && numberValue(field, 1) !== 0).length;
  const intakeProgress = completedFields / requiredFields.length;

  setMoneyField(fields.spending, plan.annualSpending);
  setMoneyField(fields.income, plan.guaranteedIncome);

  output.statusLabel.textContent = success >= 0.85 ? "On Route" : success >= 0.72 ? "On Watch" : "Needs Work";
  output.successRate.textContent = pct.format(success);
  output.incomeGap.textContent = money.format(plan.annualGap);
  output.risaStyle.textContent = plan.risaStyle;
  output.risaHeadline.textContent = plan.risaStyle;
  output.risaCopy.textContent = plan.risa.copy;
  output.suggestedModel.textContent = plan.risa.portfolio;
  output.cashYears.textContent = `${plan.risa.bucketOneYears} years`;
  output.middleYears.textContent = `${plan.risa.bucketTwoYears} years`;
  output.risaAxis.textContent = plan.risa.axis;
  output.psScore.textContent = `${plan.risaScores.ps.toFixed(1)} / 3`;
  output.ocScore.textContent = `${plan.risaScores.oc.toFixed(1)} / 3`;
  output.risaProducts.textContent = `Aligned strategies: ${plan.risa.products}.`;
  output.risaStress.textContent = `Behavioral warning: ${plan.risa.stress}`;

  output.portfolioDescription.textContent = `${plan.portfolio.description} Data period: ${SHERPA_DFA_DATA.period.start} to ${SHERPA_DFA_DATA.period.end}, ${SHERPA_DFA_DATA.period.periodicity}.`;
  output.annReturn.textContent = pct.format(plan.portfolio.annualizedReturn);
  output.annRisk.textContent = pct.format(plan.portfolio.standardDeviation);
  output.bestYear.textContent = `${pct.format(plan.portfolio.highOneYear)} from ${plan.portfolio.highOneYearStart}`;
  output.worstYear.textContent = `${pct.format(plan.portfolio.lowOneYear)} from ${plan.portfolio.lowOneYearStart}`;
  output.rangeSpread.textContent = `${pct.format(plan.portfolio.lowOneYear)} to ${pct.format(plan.portfolio.highOneYear)}`;
  output.rangeBar.style.width = `${clamp((plan.portfolio.highOneYear - plan.portfolio.lowOneYear) * 100, 24, 100)}%`;
  output.periodReturnGrid.innerHTML = [
    ["1-Year", plan.portfolio.oneYear],
    ["3-Year", plan.portfolio.threeYear],
    ["5-Year", plan.portfolio.fiveYear],
    ["10-Year", plan.portfolio.tenYear],
    ["20-Year", plan.portfolio.twentyYear],
    ["Growth of $1", plan.portfolio.growthOfWealth]
  ].map(([label, value]) => `
    <div class="rounded-lg bg-snow p-4">
      <p class="text-xs font-bold text-rock">${label}</p>
      <p class="mt-1 text-xl font-black">${label === "Growth of $1" ? `$${value.toFixed(2)}` : value === null ? "N/A" : pct.format(value)}</p>
    </div>
  `).join("");

  output.bucketOne.textContent = `${money.format(requiredCash)} target reserve. Current cash is ${money.format(plan.assets.cash)}, covering ${plan.annualGap > 0 ? (plan.assets.cash / plan.annualGap).toFixed(1) : "many"} years of the estimated gap.`;
  output.bucketTwo.textContent = `${money.format(requiredMiddle)} target stability sleeve to refill Bucket 1 during normal markets.`;
  output.bucketThree.textContent = `${money.format(longTermAssets)} growth engine after target reserves, aligned to the ${plan.portfolio.shortName} model.`;
  output.stressNarrative.textContent = `Using the ${plan.portfolio.shortName} model's worst rolling ${stressYears}-year return of ${pct.format(stressReturn)}, Bucket 1 would cover ${Math.min(plan.risa.bucketOneYears, stressYears).toFixed(1)} year(s) of withdrawals while the long-term bucket absorbs the modeled market stress.`;

  output.spendingBuild.textContent = money.format(plan.annualSpending);
  output.incomeBuild.textContent = money.format(plan.guaranteedIncome);
  output.assetBuild.textContent = money.format(plan.totalAssets);
  output.loadedClient.textContent = fields.clientName.value || "Morgan Household";
  output.intakeSummary.textContent = intakeProgress >= 0.9 ? "Client intake loaded. Review the route before presenting recommendations." : "Using the default sample household until a completed client intake is submitted.";
  output.rothWindow.textContent = rothWindowYears > 0 ? `${rothWindowYears} years` : "Closed";
  output.firstRmd.textContent = money.format(firstRmdAmount);
  output.yearOneTax.textContent = money.format(cashFlowRows[0]?.tax || 0);
  output.taxableGap.textContent = money.format(plan.grossGap);
  output.cashFlowTable.innerHTML = cashFlowRows.slice(0, 8).map((row) => `
    <tr>
      <td class="p-3 font-bold">Y${row.year}</td>
      <td class="p-3">${row.age}</td>
      <td class="p-3">${money.format(row.withdrawal)}</td>
      <td class="p-3">${money.format(row.tax)}</td>
      <td class="p-3">${money.format(row.rmd)}</td>
    </tr>
  `).join("");

  output.backtestNarrative.textContent = `A $1 backtested growth-of-wealth path ended at $${plan.portfolio.growthOfWealth.toFixed(2)} for ${plan.portfolio.shortName}. The range between best and worst rolling 1-year results is the behavior test for this route.`;

  output.actionsList.innerHTML = getActions(plan, projection, success).map(([title, body]) => `
    <div class="rounded-lg border border-white/10 bg-white/10 p-5">
      <h3 class="font-black text-trail">${title}</h3>
      <p class="mt-2 text-sm leading-6 text-glacier">${body}</p>
    </div>
  `).join("");

  renderProjectionChart(projection, plan);
  renderAllocationChart(plan.portfolio);
  renderRisaChart(plan);
  renderStressChart(plan, requiredCash, requiredMiddle, longTermAssets);
  renderCashFlowChart(cashFlowRows);
};

const init = () => {
  SHERPA_DFA_DATA.portfolios.forEach((portfolio) => {
    const option = document.createElement("option");
    option.value = portfolio.name;
    option.textContent = `${portfolio.shortName} - ${pct.format(portfolio.annualizedReturn)} return / ${pct.format(portfolio.standardDeviation)} risk`;
    fields.portfolioSelect.appendChild(option);
  });
  fields.portfolioSelect.value = "Growth";
  applyIntakeFromUrl();

  document.querySelectorAll("input, select").forEach((input) => input.addEventListener("input", update));
  document.querySelectorAll(".money").forEach((input) => {
    input.addEventListener("blur", () => {
      const value = numberValue(input);
      input.value = value ? whole.format(value) : "";
    });
  });

  renderBacktestChart();
  renderRiskReturnChart();
  renderModelTable();
  update();
};

init();
