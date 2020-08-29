const fs = require('fs')
const states = JSON.parse(fs.readFileSync('./data/states.json', 'utf-8').toString());
const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const main = async () => {
    const numbers = {};
    const s = Object.entries(states);
    for (let i = 0; i < s.length; i++) {
        const [shortName, name] = s[i];
        let r = null;
        try {
            console.log('FETCHING FOR ' + shortName);
            const result = await axios.get(`https://www.randomphonenumbers.com/Generator/us_phone_number?state=${shortName}&city=`);
            if (result) {
                // console.log(result.data)
                // fs.writeFileSync('tester.html', result.data);
                const dom = new JSDOM(result.data);
                const n_array = Array.from(dom.window.document.querySelectorAll("li[class^='col-md-6 col-sm-6'] a")).map(e => e.innerHTML);
                const descriptions = Array.from(dom.window.document.querySelectorAll("li[class^='col-md-6 col-sm-6'] p[class='des']")).map(e => e.innerHTML);
                const r = n_array.map((n, j) => {
                return {
                    number: n,
                    description: descriptions[j]
                }})
                numbers[shortName] = r;
            }
        } catch(err) {
            console.log('FAILED FOR ' + shortName);
            numbers[shortName] = null;
            console.error(err.toString());
        }
    }
    fs.writeFileSync('./data/numbers_by_state.json', JSON.stringify(numbers));
}

main()
