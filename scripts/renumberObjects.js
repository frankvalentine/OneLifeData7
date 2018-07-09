const execSync = require('child_process').execSync;
const fs = require('fs');

if (!process.argv[3]) {
    console.log(`Run with node ${process.argv[1]} <start_number> <offset>`);
    return;
}


const startNumber = Number(process.argv[2]);
const offset = Number(process.argv[3]);
let highestId = 0;

console.log('Reading object files');
const objectFileList = execSync('ls ../objects').toString().split('\n');
const objectFileNames = [];
const objectFileContents = [];

for (const file of objectFileList) {
    if (!file || isNaN(parseInt(file[0]))) {
        continue;
    }
    const fileContent = fs.readFileSync(`../objects/${file}`).toString();
    const id = fileContent.match(/id=(\d+)?\r?\n/);
    if (Number(id[1]) >= startNumber) {
        objectFileNames.push(file.replace(id[1], Number(id[1]) + offset));
        objectFileContents.push(fileContent.replace(`id=${id[1]}`, `id=${Number(id[1]) + offset}`));
        highestId = Number(id[1]) + offset > highestId ? Number(id[1]) + offset : highestId;
    } else {
        objectFileNames.push(`${id[1]}.txt`);
        objectFileContents.push(fileContent);
    }
    execSync(`rm ../objects/${file}`);
}

console.log('Writing object files');
for (let i=0; i< objectFileNames.length; i++) {
    fs.writeFileSync(`../objects/${objectFileNames[i]}`, objectFileContents[i]);
}
fs.writeFileSync(`../objects/nextObjectNumber.txt`, Number(highestId) + 1);

console.log('Reading category files');
const categoryFileList = execSync('ls ../categories/').toString().split('\n');
const categoryFileNames = [];
const categoryFileContents = [];

for (const file of categoryFileList) {
    if (!file || isNaN(parseInt(file[0]))) {
        continue;
    }
    let fileContent = fs.readFileSync(`../categories/${file}`).toString();
    const id = fileContent.match(/parentID=(\d+)?\r?\n/);
    if (Number(id[1]) >= startNumber) {
        categoryFileNames.push(file.replace(id[1], Number(id[1]) + offset));
        fileContent = fileContent.replace(`parentID=${id[1]}`, `parentID=${Number(id[1]) + offset}`)
    } else {
        categoryFileNames.push(`${id[1]}.txt`);
    }
    const categoryMembers = fileContent.match(/\r?\n\d*/g);
    for (const member of categoryMembers) {
        const idMatch = member.match(/\r?\n(\d+)/);
        if (idMatch && Number(idMatch[1]) > startNumber ) {
            fileContent = fileContent.replace(`\n${idMatch[1]}`, `\n${Number(idMatch[1]) + offset}`);
        }
    }

    categoryFileContents.push(fileContent);
    execSync(`rm ../categories/${file}`);
}

console.log('Writing category files');
for (let i=0; i< categoryFileNames.length; i++) {
    fs.writeFileSync(`../categories/${categoryFileNames[i]}`, categoryFileContents[i]);
}

console.log('Reading transition files');
const transitionFileList = execSync('ls ../transitions').toString().split('\n');
const transitionFileNames = [];
const transitionFileContents = [];

for (const file of transitionFileList) {
    if (!file || file.match(/fcz/)) {
        continue;
    }
    let fileName = file;
    let fileContent = fs.readFileSync(`../transitions/${file}`).toString();
    const actor = file.match(/([^_]+)?_/)[1];
    const target = file.match(/[^_]+_([^_]+)?[_|\.]/)[1];
    if (actor == target && Number(actor) >= startNumber) {
        fileName = fileName.replace(new RegExp(actor, 'g'), Number(actor) + offset);
    } else {
        if (Number(actor) >= startNumber) {
            fileName = fileName.replace(actor, Number(actor) + offset);
    }
        if (Number(target) >= startNumber) {
            fileName = fileName.replace(target, Number(target) + offset);
        }
    }
    const newActor = fileContent.match(/(\d+)? /)[1];
    if (Number(newActor) >= startNumber) {
        fileContent = fileContent.replace(`${newActor} `, `${Number(newActor) + offset} `);
    }
    const newTarget = fileContent.match(/\d+ (\d+)? /)[1];
    if (Number(newTarget) >= startNumber) {
        fileContent = fileContent.replace(`${newTarget} `, `${Number(newTarget) + offset} `);
    }

    transitionFileNames.push(fileName);
    transitionFileContents.push(fileContent);

    execSync(`rm ../transitions/${file}`);
}

console.log('Writing transition files');
for (let i=0; i< transitionFileNames.length; i++) {
    fs.writeFileSync(`../transitions/${transitionFileNames[i]}`, transitionFileContents[i]);
}
