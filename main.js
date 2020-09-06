const axios = require("axios");
const fs = require("fs");
const path = require('path');
const csv = require("csv/lib/sync");
const moment = require("moment");

const enums = require("./constants/enums");
const today = moment(new Date(Date.now())).format("MM/DD/YYYY");
const today_path = moment(new Date(Date.now())).format("MM_DD_YYYY");

const numbers = JSON.parse(
  fs.readFileSync("./constants/gov_numbers.json", "utf-8").toString()
);
const BASE = "https://securustech.online/ffws/api/sites/rate/";

const get_facilities = require("./get_facilities");

const reverseMapping = (o) =>
  Object.keys(o).reduce(
    (r, k) => Object.assign(r, { [o[k]]: (r[o[k]] || []).concat(k) }),
    {}
  );

const removeDollar = (str) => str.replace(/\$/g, '');

const enum_lookup = (e) => reverseMapping(enums)[`${e}`].find(Boolean);

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomStateNeq = (state) => {
  const nums = { ...numbers };
  delete nums[state];
  return randomElement(Object.values(nums));
};

const processFacility = async (facility, numbers, file, state) => {
  console.log(
    `${moment(Date.now()).format(
      "MMMM Do YYYY, h:mm:ss a"
    )} ------ Processing ${facility.siteName} ------`
  );
  const date = Date.now();
  for (let j = 0; j < Object.values(enums).length; j++) {
    const service = Object.values(enums)[j];
    let in_state = null;
    let out_state = null;
    try {
      in_state = (
        await axios.get(
          BASE +
            facility.siteId +
            `?phoneNumber=${numbers[0]}&countryCode=1&serviceId=${service}`
        )
      ).data;
      
      fs.appendFileSync(
        file,
        csv.stringify([
          {
            today,
            state,
            facility: facility.siteName,
            service: enum_lookup(service),
            in_state: true,
            number: numbers[0],
            surCharge: removeDollar(in_state.result.surCharge),
            initalAmount: removeDollar(in_state.result.initalAmount),
            additionalAmount: removeDollar(in_state.result.additionalAmount),
            totalAmount: removeDollar(in_state.result.totalAmount),
            quoteRule: in_state.result.quoteRule,
            feeName: in_state.result.feeName,
            ratePerMinute: removeDollar(in_state.result.ratePerMinute),
          },
        ])
      );
      await new Promise((resolve) => setTimeout(resolve, 250));
      out_state = (
        await axios.get(
          BASE +
            facility.siteId +
            `?phoneNumber=${numbers[1]}&countryCode=1&serviceId=${service}`
        )
      ).data;
      fs.appendFileSync(
        file,
        csv.stringify([
          {
            today,
            state,
            facility: facility.siteName,
            service: enum_lookup(service),
            in_state: false,
            number: numbers[1],
            surCharge: removeDollar(out_state.result.surCharge),
            initalAmount: removeDollar(out_state.result.initalAmount),
            additionalAmount: removeDollar(out_state.result.additionalAmount),
            totalAmount: removeDollar(out_state.result.totalAmount),
            quoteRule: out_state.result.quoteRule,
            feeName: out_state.result.feeName,
            ratePerMinute: removeDollar(out_state.result.ratePerMinute),
          },
        ])
      );
    } catch (err) {
      fs.appendFileSync(
        "./errors/index.log",
        moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a") +
          " " +
          facility.siteName +
          " " +
          err.toString() +
          "\n"
      );
      console.error(err.toString());
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
};

const processState = async (facilities, shortName, file) => {
  console.log(`------ Processing ${shortName} ------`);
  for (facility of facilities) {
    let ns;
    try {
      ns = [
        numbers[shortName].replace(/-/g, ""),
        getRandomStateNeq(shortName).replace(/-/g, ""),
      ];
      await processFacility(facility, ns, file, shortName);
    } catch (err) {
      fs.appendFileSync(
        "./errors/index.log",
        moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a") +
          " " +
          facility.siteName +
          " " +
          err.toString() +
          "\n"
      );
      console.error(err.toString());
    }
  }
};

const main = async () => {
  const BASE = path.join("scraped/", today_path);
  const FILE = `${BASE}/results.csv`;
  try {
    fs.mkdirSync(BASE, { recursive: true });
  } catch (err) {r
    console.err(err.toString());
  }

  fs.writeFileSync(
    FILE,
    `date,state,facility,service,in_state,number,surCharge,initialAmount,additionalAmount,totalAmount,quoteRule,feeName,ratePerMinute\n`
  );

  const facilities = await get_facilities(today_path);
  const states = Object.keys(facilities);
  for (state of states) {
      if (state !== 'AK') return
    await processState(facilities[state], state, FILE);
  }
};

main();
