const execSync = require('child_process').execSync;
const fs = require('fs');

if (!process.argv[3]) {
    console.log(`Run with node ${process.argv[1]} <start_number> <offset>`);
    return;
}


const startNumber = Number(process.argv[2]);
const offset = Number(process.argv[3]);
let highestId = 0;
let spriteIds = [];

console.log('Reading sprite files');
const spriteFileList = execSync('ls ../sprites').toString().split('\n');

for (const file of spriteFileList) {
    if (!file || isNaN(parseInt(file[0]))) {
        continue;
    }
    if (!file.endsWith('.txt')) {
        continue;
    }
    const thisId = Number(file.replace('.txt', ''));
    if (thisId >= startNumber) {
        spriteIds.push(thisId);
        highestId = thisId + offset > highestId ? thisId + offset : highestId;
    }
}

console.log('Moving sprite files');
for (const id of spriteIds) {
    execSync(`mv ../sprites/${id}.txt ../sprites/new_${id + offset}.txt`);
    execSync(`mv ../sprites/${id}.tga ../sprites/new_${id + offset}.tga`);
}

for (const id of spriteIds) {
    execSync(`mv ../sprites/new_${id + offset}.txt ../sprites/${id + offset}.txt`);
    execSync(`mv ../sprites/new_${id + offset}.tga ../sprites/${id + offset}.tga`);
}

fs.writeFileSync(`../sprites/nextSpriteNumber.txt`, highestId + 1);

console.log('Reading object files');
const objectFileList = execSync('ls ../objects').toString().split('\n');

console.log('Updating object files');
for (const file of objectFileList) {
    if (!file || isNaN(parseInt(file[0]))) {
        continue;
    }
    let fileContent = fs.readFileSync(`../objects/${file}`).toString();
    const spriteMatch = fileContent.match(/spriteID=(\d+)?\r?\n/g);
    let spriteIds = [];
    for (const match of spriteMatch) {
        const spriteId = Number(match.match(/spriteID=(\d+)?/)[1]);
        if (spriteId >= startNumber) {
            spriteIds.push(spriteId);
        }
    }
    for (const id of spriteIds) {
        fileContent = fileContent.replace(`spriteID=${id}`, `spriteID=${id + offset}`);
    }
    fs.writeFileSync(`../objects/${file}`, fileContent);
}
