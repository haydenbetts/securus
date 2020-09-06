const fs = require("fs");
const csv = require("csv/lib/sync");
const moment = require("moment");
const states = JSON.parse(
  fs.readFileSync("./constants/securas_states.json", "utf-8").toString()
);
const axios = require("axios");

const path = require("path");

const transformFacilities = (csvFile) => {
    const t = {};

    csv.parse(fs.readFileSync(csvFile)).forEach((e, i) => {
        if (i === 0) return;
        const [date, state, siteId, siteName, customerId, displayId, displayName, onSiteUserAccountNeeded] = e;
        if (!t[state]) t[state] = [];
        t[state].push({date, state, siteId, siteName, customerId, displayId, displayName, onSiteUserAccountNeeded});

    })

    return t;
}

const main = async (today = moment(new Date()).format("MM_DD_YYYY")) => {
  const BASE = path.join("scraped/", today);
  const FILE = `${BASE}/facilities.csv`;
  try {
    fs.mkdirSync(BASE, { recursive: true });
    fs.appendFileSync(
      FILE,
      `date,state,siteId,siteName,customerId,displayId,displayName,onSiteUserAccountNeeded\n`
    );
  } catch (err) {
    console.err(err.toString());
  }

  for (let i = 0; i < 1; i++) {
    const state = states[i];
    try {
      console.log(`----- Fetching for ${state} -----`);
      const result = await axios.get(
        `https://securustech.online/ffws/api/sites/?state=${state}&acctType=ALL`
      );
      for (r of result.data.resultList) {
        const {
          siteId,
          siteName,
          customerId,
          displayId,
          displayName,
          onSiteUserAccountNeeded,
        } = r;
        fs.appendFileSync(
          FILE,
          csv.stringify([
            {
              today: today.replace(/_/g, '/'),
              state,
              siteId,
              siteName,
              customerId,
              displayId,
              displayName,
              onSiteUserAccountNeeded,
            },
          ])
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.log(`----- Failed for ${state} -----`);
      console.log(err);
      securas_facilities[state] = null;
    }
  }
  return transformFacilities(FILE);
};

module.exports = main;
