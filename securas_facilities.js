const fs = require('fs');
const states = JSON.parse(fs.readFileSync('./scraped/securas_states.json', 'utf-8').toString());
const axios = require('axios');

const REQ = (state) => `https://securustech.online/ffws/api/sites/?state=${state}&acctType=ALL`

const main = async () => {
    const securas_facilities = {};
    for (let i = 0; i < states.length; i++) {
        const state = states[i];
        try {
            console.log(`----- Fetching for ${state} -----`)
            const result = await axios.get(`https://securustech.online/ffws/api/sites/?state=${state}&acctType=ALL`);
            securas_facilities[state] = result.data.resultList;
            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (err) {
            console.log(`----- Failed for ${state} -----`)
            console.log(err)
            securas_facilities[state] = null
        }
    }
    await fs.writeFileSync('./scraped/securas_facilities.json', JSON.stringify(securas_facilities));
}

main();