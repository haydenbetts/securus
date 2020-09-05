const fs = require('fs');
const diff = require("deep-object-diff").deletedDiff;
const one = require('./scraped/securas_facilities.json')
const two = require('./scraped/securas_facilities_9_5.json')

let str = 'state,siteId,siteName,customerId,displayId,displayName,address1,address2,city,zipCd,onSiteUserAccountNeeded\n'

fs.writeFileSync('./scraped/securas_facilities_2.csv', str + Object.entries(two).map(([k, v]) => {
    const state = k;
    return v.map((v) => {
        return `${state},${v.siteId},${v.siteName},${v.customerId},${v.displayName},${v.address1},${v.address2},${v.zipCd},${v.onSiteUserAccountNeeded}`
    }).join('\n');
}).join(''))