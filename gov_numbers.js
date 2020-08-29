const fs = require('fs');
const axios = require('axios');
const jsdom = require("jsdom");
var states = require('us-state-codes');
const { JSDOM } = jsdom;

const main = async () => {
    const numbers = {};

    const result = await axios.get(`https://www.prisonpolicy.org/phones/appendix_table_6.html`);
    if (result) {
        const dom = new JSDOM(result.data);
        const n_array = Array.from(dom.window.document.querySelectorAll('tr td')).map(e => e.innerHTML);
        const r = n_array.forEach((n, j) => {
        if (j % 2 !== 0) return;
        numbers[states.getStateCodeByStateName(n)] = n_array[j + 1];
        })
    }
  
    fs.writeFileSync('./data/gov_numbers.json', JSON.stringify(numbers));
}

main()