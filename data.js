const LTC_COSTS = {
  AL: { name: "Alabama", nursingHome: 87960, inHome: 61776, assistedLiving: 54600 },
  AK: { name: "Alaska", nursingHome: 378432, inHome: 87360, assistedLiving: 85500 },
  AZ: { name: "Arizona", nursingHome: 111324, inHome: 69984, assistedLiving: 60000 },
  AR: { name: "Arkansas", nursingHome: 85176, inHome: 56016, assistedLiving: 48000 },
  CA: { name: "California", nursingHome: 146000, inHome: 82368, assistedLiving: 72000 },
  CO: { name: "Colorado", nursingHome: 123516, inHome: 75504, assistedLiving: 66000 },
  CT: { name: "Connecticut", nursingHome: 182500, inHome: 72072, assistedLiving: 69000 },
  DE: { name: "Delaware", nursingHome: 147456, inHome: 68640, assistedLiving: 78000 },
  DC: { name: "District of Columbia", nursingHome: 167900, inHome: 75504, assistedLiving: 78000 },
  FL: { name: "Florida", nursingHome: 123600, inHome: 65208, assistedLiving: 60000 },
  GA: { name: "Georgia", nursingHome: 103200, inHome: 61776, assistedLiving: 52080 },
  HI: { name: "Hawaii", nursingHome: 190236, inHome: 75504, assistedLiving: 67500 },
  ID: { name: "Idaho", nursingHome: 112200, inHome: 65208, assistedLiving: 57000 },
  IL: { name: "Illinois", nursingHome: 102492, inHome: 66300, assistedLiving: 63000 },
  IN: { name: "Indiana", nursingHome: 111684, inHome: 61776, assistedLiving: 57840 },
  IA: { name: "Iowa", nursingHome: 100200, inHome: 61776, assistedLiving: 55200 },
  KS: { name: "Kansas", nursingHome: 97380, inHome: 59436, assistedLiving: 60000 },
  KY: { name: "Kentucky", nursingHome: 102000, inHome: 59436, assistedLiving: 54300 },
  LA: { name: "Louisiana", nursingHome: 85080, inHome: 56016, assistedLiving: 48000 },
  ME: { name: "Maine", nursingHome: 152040, inHome: 68640, assistedLiving: 70800 },
  MD: { name: "Maryland", nursingHome: 142350, inHome: 68640, assistedLiving: 72000 },
  MA: { name: "Massachusetts", nursingHome: 185400, inHome: 75504, assistedLiving: 81000 },
  MI: { name: "Michigan", nursingHome: 119400, inHome: 64044, assistedLiving: 57000 },
  MN: { name: "Minnesota", nursingHome: 145200, inHome: 75504, assistedLiving: 60000 },
  MS: { name: "Mississippi", nursingHome: 91200, inHome: 51480, assistedLiving: 48000 },
  MO: { name: "Missouri", nursingHome: 84300, inHome: 59436, assistedLiving: 51000 },
  MT: { name: "Montana", nursingHome: 113400, inHome: 65208, assistedLiving: 55200 },
  NE: { name: "Nebraska", nursingHome: 101400, inHome: 61776, assistedLiving: 60000 },
  NV: { name: "Nevada", nursingHome: 121800, inHome: 68640, assistedLiving: 57000 },
  NH: { name: "New Hampshire", nursingHome: 159600, inHome: 72072, assistedLiving: 78000 },
  NJ: { name: "New Jersey", nursingHome: 161700, inHome: 72072, assistedLiving: 87000 },
  NM: { name: "New Mexico", nursingHome: 100800, inHome: 59436, assistedLiving: 54000 },
  NY: { name: "New York", nursingHome: 180000, inHome: 75504, assistedLiving: 78000 },
  NC: { name: "North Carolina", nursingHome: 104400, inHome: 61776, assistedLiving: 60000 },
  ND: { name: "North Dakota", nursingHome: 147000, inHome: 65208, assistedLiving: 54000 },
  OH: { name: "Ohio", nursingHome: 108000, inHome: 61776, assistedLiving: 60000 },
  OK: { name: "Oklahoma", nursingHome: 88800, inHome: 56016, assistedLiving: 48000 },
  OR: { name: "Oregon", nursingHome: 150000, inHome: 75504, assistedLiving: 67200 },
  PA: { name: "Pennsylvania", nursingHome: 139200, inHome: 65208, assistedLiving: 63600 },
  RI: { name: "Rhode Island", nursingHome: 150000, inHome: 68640, assistedLiving: 72000 },
  SC: { name: "South Carolina", nursingHome: 104400, inHome: 59436, assistedLiving: 54000 },
  SD: { name: "South Dakota", nursingHome: 107400, inHome: 61776, assistedLiving: 51000 },
  TN: { name: "Tennessee", nursingHome: 101400, inHome: 59436, assistedLiving: 54000 },
  TX: { name: "Texas", nursingHome: 93000, inHome: 61776, assistedLiving: 54000 },
  UT: { name: "Utah", nursingHome: 104400, inHome: 65208, assistedLiving: 51000 },
  VT: { name: "Vermont", nursingHome: 150000, inHome: 72072, assistedLiving: 72000 },
  VA: { name: "Virginia", nursingHome: 125400, inHome: 65208, assistedLiving: 67200 },
  WA: { name: "Washington", nursingHome: 150000, inHome: 82368, assistedLiving: 78000 },
  WV: { name: "West Virginia", nursingHome: 121800, inHome: 56016, assistedLiving: 54000 },
  WI: { name: "Wisconsin", nursingHome: 121200, inHome: 65208, assistedLiving: 60000 },
  WY: { name: "Wyoming", nursingHome: 114000, inHome: 65208, assistedLiving: 54000 }
};

const CARE_LABELS = {
  nursingHome: "Nursing home care",
  inHome: "In-home care",
  assistedLiving: "Assisted living care"
};

const NATIONAL_AVERAGES = Object.values(LTC_COSTS).reduce(
  (totals, state, _index, states) => {
    totals.nursingHome += state.nursingHome / states.length;
    totals.inHome += state.inHome / states.length;
    totals.assistedLiving += state.assistedLiving / states.length;
    return totals;
  },
  { nursingHome: 0, inHome: 0, assistedLiving: 0 }
);
