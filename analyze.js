const fs = require('fs');
const mi = JSON.parse(fs.readFileSync('./results.json', 'utf-8').toString());
const enums = require('./enums');
const reverseMapping = o => Object.keys(o).reduce((r, k) =>
        Object.assign(r, { [o[k]]: (r[o[k]] || []).concat(k) }), {})

const enum_lookup = (e) => reverseMapping(enums)[`${e}`].find(Boolean)

fs.writeFileSync('./mi.csv', `facility,date,state,service,in_state,number,surCharge,initialAmount,additionalAmount,totalAmount,quoteRule,feeName,ratePerMinute\n`);


for (let i = 3; i < mi.length; i++) {
    const f = mi[i];
    for (let j = 0; j < f.results_by_service.length; j++) {
        const rbs = f.results_by_service[j];
        fs.appendFileSync('./mi.csv',`${f.facility},${f.date},${f.state},${enum_lookup(rbs.service)},true,${rbs.in_state.number},${rbs.in_state.response.surCharge},${rbs.in_state.response.initalAmount},${rbs.in_state.response.additionalAmount},${rbs.in_state.response.totalAmount},${rbs.in_state.response.quoteRule},${rbs.in_state.response.feeName},${rbs.in_state.response.ratePerMinute}\n`)

        fs.appendFileSync('./mi.csv',`${f.facility},${f.date},${f.state},${enum_lookup(rbs.service)},false,${rbs.out_state.number},${rbs.out_state.response.surCharge},${rbs.out_state.response.initalAmount},${rbs.out_state.response.additionalAmount},${rbs.out_state.response.totalAmount},${rbs.out_state.response.quoteRule},${rbs.out_state.response.feeName},${rbs.out_state.response.ratePerMinute}\n`)
    }
}