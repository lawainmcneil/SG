const SHERPA_DFA_DATA = {
  period: {
    periodicity: "Monthly",
    start: "6/1/2012",
    end: "3/31/2026",
    currency: "USD",
    source: "DFA Returns Program exports supplied by advisor"
  },
  portfolios: [
    {
      name: "Fixed | Capital Preservation",
      shortName: "Fixed",
      style: "Income Protector",
      description: "Capital preservation with a large short-term credit, bond, and TIPS foundation.",
      annualizedReturn: 0.0314362635,
      standardDeviation: 0.0356566776,
      oneYear: 0.0564207665,
      threeYear: 0.0543683472,
      fiveYear: 0.0242663445,
      tenYear: 0.0325084184,
      twentyYear: 0.0384355947,
      growthOfWealth: 1.5344514435,
      highOneYear: 0.1161024091,
      highOneYearStart: "10/1/2023",
      lowOneYear: -0.1081806231,
      lowOneYearStart: "11/1/2021",
      allocations: [
        ["Short-Term Credit Bonds", 40],
        ["US Aggregate Bonds", 25],
        ["TIPS", 15],
        ["Global Bonds Hedged", 10],
        ["US Total Market", 5],
        ["International Developed", 5]
      ]
    },
    {
      name: "Income",
      shortName: "Income",
      style: "Income Protector",
      description: "Income and moderate stability using bonds, TIPS, global REITs, and limited global equity.",
      annualizedReturn: 0.0293911048,
      standardDeviation: 0.0491978612,
      oneYear: 0.0530607825,
      threeYear: 0.0478831755,
      fiveYear: 0.0159499118,
      tenYear: 0.0271059584,
      twentyYear: null,
      growthOfWealth: 1.4928941626,
      highOneYear: 0.1326341732,
      highOneYearStart: "10/1/2023",
      lowOneYear: -0.1409779078,
      lowOneYearStart: "11/1/2021",
      allocations: [
        ["US Aggregate Bonds", 35],
        ["Global Bonds Hedged", 25],
        ["TIPS", 15],
        ["Short-Term Credit Bonds", 10],
        ["Global REITs", 10],
        ["Global ex-US Equity", 5]
      ]
    },
    {
      name: "Balanced",
      shortName: "Balanced",
      style: "Conservative Growth",
      description: "A 60/40-style global allocation balancing growth, stability, and inflation defense.",
      annualizedReturn: 0.0799241023,
      standardDeviation: 0.0905009492,
      oneYear: 0.136322796,
      threeYear: 0.1134439718,
      fiveYear: 0.0612531811,
      tenYear: 0.0791665605,
      twentyYear: 0.066319984,
      growthOfWealth: 2.8969415881,
      highOneYear: 0.3202039879,
      highOneYearStart: "4/1/2020",
      lowOneYear: -0.1790956545,
      lowOneYearStart: "10/1/2021",
      allocations: [
        ["US Total Market", 35],
        ["US Aggregate Bonds", 25],
        ["International Developed", 15],
        ["Global ex-US Equity", 10],
        ["Global Bonds Hedged", 10],
        ["TIPS", 5]
      ]
    },
    {
      name: "Growth",
      shortName: "Growth",
      style: "Moderate Growth",
      description: "Long-term appreciation with broad global equities and a stabilizing bond sleeve.",
      annualizedReturn: 0.0977774327,
      standardDeviation: 0.1132122542,
      oneYear: 0.1714667702,
      threeYear: 0.138703657,
      fiveYear: 0.0781118228,
      tenYear: 0.0971724819,
      twentyYear: 0.0745476229,
      growthOfWealth: 3.63452615,
      highOneYear: 0.4310731824,
      highOneYearStart: "4/1/2020",
      lowOneYear: -0.197637421,
      lowOneYearStart: "10/1/2021",
      allocations: [
        ["US Total Market", 45],
        ["US Aggregate Bonds", 20],
        ["International Developed", 20],
        ["Global ex-US Equity", 15]
      ]
    },
    {
      name: "Aggressive",
      shortName: "Aggressive",
      style: "Growth Maximizer",
      description: "Maximum growth orientation with global equity concentration and a small bond sleeve.",
      annualizedReturn: 0.1120256193,
      standardDeviation: 0.1319949575,
      oneYear: 0.1982221074,
      threeYear: 0.1568338009,
      fiveYear: 0.0903515832,
      tenYear: 0.1112372391,
      twentyYear: 0.0809249472,
      growthOfWealth: 4.3443149266,
      highOneYear: 0.5406418148,
      highOneYearStart: "4/1/2020",
      lowOneYear: -0.208013909,
      lowOneYearStart: "10/1/2021",
      allocations: [
        ["US Total Market", 50],
        ["International Developed", 25],
        ["Global ex-US Equity", 15],
        ["US Aggregate Bonds", 5],
        ["US Small Cap", 5]
      ]
    }
  ],
  growthOfWealth: [
    { date: "12/31/2012", "Fixed | Capital Preservation": 1.0346341949, Income: 1.042379019, Balanced: 1.0979086129, Growth: 1.1254354998, Aggressive: 1.1458963621 },
    { date: "12/31/2013", "Fixed | Capital Preservation": 1.047921603, Income: 1.033489683, Balanced: 1.2629107544, Growth: 1.3641885782, Aggressive: 1.4510596395 },
    { date: "12/31/2014", "Fixed | Capital Preservation": 1.085949268, Income: 1.1022937684, Balanced: 1.3344554043, Growth: 1.4348060671, Aggressive: 1.5237622524 },
    { date: "12/31/2015", "Fixed | Capital Preservation": 1.0909501967, Income: 1.1054655704, Balanced: 1.336230596, Growth: 1.4326570975, Aggressive: 1.5160795471 },
    { date: "12/31/2016", "Fixed | Capital Preservation": 1.1276768025, Income: 1.1472408783, Balanced: 1.4224169443, Growth: 1.5352052425, Aggressive: 1.6430060298 },
    { date: "12/31/2017", "Fixed | Capital Preservation": 1.1783448367, Income: 1.2015801344, Balanced: 1.6368096374, Growth: 1.8329878867, Aggressive: 2.0086760213 },
    { date: "12/31/2018", "Fixed | Capital Preservation": 1.1753991152, Income: 1.1929833136, Balanced: 1.555738751, Growth: 1.704980762, Aggressive: 1.8386895539 },
    { date: "12/31/2019", "Fixed | Capital Preservation": 1.2798095098, Income: 1.3166233984, Balanced: 1.8625551331, Growth: 2.1036182333, Aggressive: 2.3195317032 },
    { date: "12/31/2020", "Fixed | Capital Preservation": 1.3725063464, Income: 1.3953490274, Balanced: 2.1117102177, Growth: 2.413506574, Aggressive: 2.6832915978 },
    { date: "12/31/2021", "Fixed | Capital Preservation": 1.4007452563, Income: 1.441334589, Balanced: 2.3405890244, Growth: 2.758766744, Aggressive: 3.1536413633 },
    { date: "12/31/2022", "Fixed | Capital Preservation": 1.2726767149, Income: 1.2601103703, Balanced: 1.9845024219, Growth: 2.3079433896, Aggressive: 2.6173194374 },
    { date: "12/31/2023", "Fixed | Capital Preservation": 1.3621373017, Income: 1.3464946112, Balanced: 2.2961620949, Growth: 2.7443891686, Aggressive: 3.1763756963 },
    { date: "12/31/2024", "Fixed | Capital Preservation": 1.4212609046, Income: 1.3828677571, Balanced: 2.5264715436, Growth: 3.085060379, Aggressive: 3.6314992687 },
    { date: "12/31/2025", "Fixed | Capital Preservation": 1.5357148278, Income: 1.4905663028, Balanced: 2.9428521136, Growth: 3.710319763, Aggressive: 4.440982835 },
    { date: "3/31/2026", "Fixed | Capital Preservation": 1.5344514435, Income: 1.4928941626, Balanced: 2.8969415881, Growth: 3.63452615, Aggressive: 4.3443149266 }
  ],
  risaMap: {
    "Income Protector": {
      portfolio: "Income",
      bucketOneYears: 3,
      bucketTwoYears: 7,
      copy: "Safety and commitment are leading the conversation. Lead with durable income, larger reserves, and clear guardrails."
    },
    "Conservative Growth": {
      portfolio: "Balanced",
      bucketOneYears: 2.5,
      bucketTwoYears: 6,
      copy: "The client wants growth, but the plan must make volatility feel survivable. Keep a sturdy middle bucket."
    },
    "Moderate Growth": {
      portfolio: "Growth",
      bucketOneYears: 2,
      bucketTwoYears: 5,
      copy: "The client can use market returns, but values flexibility. Balance optionality with disciplined refill rules."
    },
    "Growth Maximizer": {
      portfolio: "Aggressive",
      bucketOneYears: 1.5,
      bucketTwoYears: 4,
      copy: "The client is growth-oriented and can commit to a long runway. Protect behavior during drawdowns."
    }
  }
};
