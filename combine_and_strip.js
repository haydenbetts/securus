const fs = require('fs');

const main = async () => {
    let files;
    let all = '';
    fs.readdir('./states', (err, fls) => {
       const  files = [...fls.map(e => './states/' + e)];

       for (let i = 0; i < files.length; i++) {
        let f = fs.readFileSync(files[i], 'utf-8').toString().split('\n');

        if (i === 0) all += f[0] + '\n';
        for (let j = 1; j < f.length; j++) {


                    // fix issue of commas in the facility name field
        if (f[j].split(',').length === 14) {
            f[j] = f[j].split(',');
            f[j] = f[j].map((e, i) => {
                if (i === 2) return e + f[j][i + 1];
                if (i === 3) return null
                return e;
            }).filter(Boolean).join(',');
        }

            all += f[j].replace(/\$/g, '');
            if (j < f.length -1) all += '\n';
        }
    }
    fs.writeFileSync('./combined.csv', all);
})    
}

main()

