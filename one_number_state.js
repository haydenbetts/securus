const fs = require('fs');
const numbers = JSON.parse(fs.readFileSync('./data/numbers_by_state.json', 'utf-8').toString());

const one_state = {};
Object.entries(numbers).forEach(([k,v]) => {
        one_state[k] = v.slice(0,1)
})

fs.writeFileSync('./data/one_number_per_state.json', JSON.stringify(one_state))