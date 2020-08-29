const faker = require('faker');
const enums = require('./enums');
const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const numbers = JSON.parse(fs.readFileSync('./data/gov_numbers.json', 'utf-8').toString());
const facilities = JSON.parse(fs.readFileSync('./scraped/securas_facilities.json', 'utf-8').toString());


const reverseMapping = o => Object.keys(o).reduce((r, k) =>
        Object.assign(r, { [o[k]]: (r[o[k]] || []).concat(k) }), {})

const enum_lookup = (e) => reverseMapping(enums)[`${e}`].find(Boolean)

const BASE = 'https://securustech.online/ffws/api/sites/rate/';

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const number = () => faker.phone.phoneNumberFormat(0).replace(/-/g, '').slice(3);

const getRandomStateNeq = (state) => {
    const nums = {...numbers};
    delete nums[state];
    return randomElement(Object.values(nums));
}

const processFacility = async (facility, numbers, file, state) => {
    console.log(`${moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a')} ------ Processing ${facility.siteName} ------`)
    const date = Date.now();
    for (let j = 0; j < Object.values(enums).length; j++) {
        const service = Object.values(enums)[j];
        let in_state = null;
        let out_state = null
        try {
            in_state = (await axios.get(BASE + facility.siteId + `?phoneNumber=${numbers[0]}&countryCode=1&serviceId=${service}`)).data;
            // console.log(in_state)
            fs.appendFileSync(file,`${state},${date},${facility.siteName},${enum_lookup(service)},true,${numbers[0]},${in_state.result.surCharge},${in_state.result.initalAmount},${in_state.result.additionalAmount},${in_state.result.totalAmount},${in_state.result.quoteRule},${in_state.result.feeName},${in_state.result.ratePerMinute}\n`)
            await new Promise(resolve => setTimeout(resolve, 250));
            out_state = (await axios.get(BASE + facility.siteId + `?phoneNumber=${numbers[1]}&countryCode=1&serviceId=${service}`)).data;
            fs.appendFileSync(file,`${state},${date},${facility.siteName},${enum_lookup(service)},false,${numbers[1]},${out_state.result.surCharge},${out_state.result.initalAmount},${out_state.result.additionalAmount},${out_state.result.totalAmount},${out_state.result.quoteRule},${out_state.result.feeName},${out_state.result.ratePerMinute}\n`)
        } catch(err) {
            fs.appendFileSync('./errors/index.log', moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a') + ' ' + facility.siteName + ' ' + err.toString() + '\n')
            console.error(err.toString());
        }
        await new Promise(resolve => setTimeout(resolve, 250));
    }
}

const processState = async (facilities, shortName) => {
    console.log(`------ Processing ${shortName} ------`)
    const file = `./states/${shortName}.csv`;
    fs.writeFileSync(file, `state,date,facility,service,in_state,number,surCharge,initialAmount,additionalAmount,totalAmount,quoteRule,feeName,ratePerMinute\n`);
    for (let i = 0; i < facilities.length; i++) {
        const facility = facilities[i];
        let ns;
        try {
            ns = [numbers[shortName].replace(/-/g, ''), getRandomStateNeq(shortName).replace(/-/g, '')];
            await processFacility(facility, ns, file, shortName);
        } catch(err) {
            fs.appendFileSync('./errors/index.log', moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a') + ' ' + facility.siteName + ' ' + err.toString() + '\n');
            console.error(err.toString())
        }
    }
}

const main  = async () => {
   const states = Object.keys(facilities);
   for (let i = 19; i < states.length; i++) {
       await processState(facilities[states[i]], states[i])
   }
}

main();