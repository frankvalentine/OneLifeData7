fs = require('fs');
execSync = require('child_process').execSync;

let nextObjectNumber = fs.readFileSync('../objects/nextObjectNumber.txt').toString();
const startGap = Number(process.argv[2]) || 1000;
const endGap = Number(process.argv[3]) || 1000;
let missingObjectNumbers = [];
// nextObjectNumber = 15;


let objectList = '\n';
let transitionList = '\n';
objectList += execSync('ls ../objects/');
transitionList += execSync('ls ../transitions/');

for (let i=11; i<nextObjectNumber; i++) {
    if (i>startGap && i<endGap) {
        continue;
    }
    const exp = new RegExp(`\\n${i}.txt`, 'g');
    if (!objectList.match(exp)) {
        missingObjectNumbers.push(i);
    }
}

for (const id of missingObjectNumbers) {
    const exp0 = new RegExp(`\[\^\\d\]${id}\[\^\\d\]`, 'g');
    if (transitionList.match(exp0)) {
        const exp1 = new RegExp(`\\n${id}\(.*\)\?.txt`, 'g');
        const exp2 = new RegExp(`\\n\(.*\)\?_${id}.txt`, 'g');
        let transitionMatches = transitionList.match(exp1);
        transitionMatches = transitionMatches ? transitionMatches.concat(transitionList.match(exp2)) : transitionList.match(exp2);
        console.log(`Found references to missing object ${id}`);
        for (const match of transitionMatches) {
            if (match){
                console.log(match.replace('\n', ''));
            }
        }
    }
    try {
        console.log(execSync(`grep -r '^${id} ' ../transitions/`).toString());
    } catch (e){

    }
    try {
        console.log(execSync(`grep -r '^[0-9]* ${id} ' ../transitions/`).toString());
    } catch (e){

    }
}