"use strict";
/* This script was used to create the 2hol removal keys. There will be probably no need to run that again */

const findInFiles = require('find-in-files');
const glob = require("glob");
const fs = require('fs');

const OBJECTS_PATH = '../objects/';

async function main() {
	const results = await findKeyFiles();
	for (var result in results) {
		var res = results[result];
		const fileName = result;
		const objId = fileName.replace('.txt', '').replace(OBJECTS_PATH, '');
		const keyName = res.line[0];
		const nextFileNumber = await getNextFileNumber();
		await createRemovalKeyObject(fileName, keyName, nextFileNumber);
		await createTransictionToCreateRemovalKey(objId, nextFileNumber);
		await createTransictionToRemoveLock(objId, nextFileNumber);
		await createTransictionToRevertToKey(objId, nextFileNumber);
	}
}

async function createRemovalKeyObject(sourceKeyFile, keyName, nextFileNumber) {
	return new Promise(resolve => {
		fs.readFile(sourceKeyFile, 'utf8', async function (err, data) {
			if (err) {
				return console.log(err);
			}
			var replacedData = data.replace(keyName, `${keyName} Removal`);
			replacedData = replacedData.replace(/id=.*/gm, `id=${nextFileNumber}`);
			fs.writeFile(`${OBJECTS_PATH}${nextFileNumber}.txt`, replacedData, 'utf8', function (err) {
				console.log(`FILE CREATED`, `${nextFileNumber}.txt`);
				if (err) return console.log(err);
				resolve();
			});
		});
	});
}

async function createTransictionToCreateRemovalKey(keyId, nextFileNumber) {
	return new Promise(resolve => {
		const HAMMER_ID = 441;
		const transictionFileName = `../transitions/${HAMMER_ID}_${keyId}.txt`;
		const fileContent = `${HAMMER_ID} ${nextFileNumber} 0 0.000000 0.000000 0 0 0 1 0 0`
		fs.writeFile(transictionFileName, fileContent, 'utf8', function (err) {
			console.log(`REMOVAL KEY FILE CREATED`, transictionFileName);
			if (err) return console.log(err);
			resolve();
		});
	})
}

async function createTransictionToRevertToKey(keyId, nextFileNumber) {
	return new Promise(resolve => {
		const STEEL_FILE_ID = 458;
		const transictionFileName = `../transitions/${STEEL_FILE_ID}_${nextFileNumber}.txt`;
		const fileContent = `${STEEL_FILE_ID} ${keyId} 0 0.000000 0.000000 0 0 0 1 0 0`
		fs.writeFile(transictionFileName, fileContent, 'utf8', function (err) {
			console.log(`REVERT KEY FILE CREATED`, transictionFileName);
			if (err) return console.log(err);
			resolve();
		});
	})
}

async function createTransictionToRemoveLock(keyId, nextFileNumber) {
	return new Promise(resolve => {
		glob(`../transitions/${keyId}_*.txt`, {}, function (er, files) {
			files.forEach((fileName) => {
				if (fileName.includes('_114.txt')) return; //ignoring transiction with detached pine door
				const targetId = fileName.replace(`../transitions/${keyId}_`, '').replace('.txt', '');
				const transictionFileName = `../transitions/${nextFileNumber}_${targetId}.txt`;
				const PINE_DOOR_INSTALLED_ID = 115;
				const fileContent = `${nextFileNumber} ${PINE_DOOR_INSTALLED_ID} 0 0.000000 0.000000 0 0 0 1`
				fs.writeFile(transictionFileName, fileContent, 'utf8', function (err) {
					console.log(`REMOVE LOCK FILE CREATED`, transictionFileName);
					if (err) return console.log(err);
					resolve();
				});
			});
		})
	})
}

function findKeyFiles() {
	return findInFiles.find({'term': "key \\(", 'flags': 'ig'}, '../objects', '.txt$');
}

async function getNextFileNumber() {
	const NEXT_OBJECT_FILE = '../objects/nextObjectNumber.txt';
	return new Promise(resolve => {
		fs.readFile(NEXT_OBJECT_FILE, 'utf8', function (err, data) {
			if (err) {
				return console.log(err);
			}
			const nextFileNumber = Number(data);
			const incFileNumber = nextFileNumber + 1;
			fs.writeFile(NEXT_OBJECT_FILE, incFileNumber, 'utf8', function (err) {
				if (err) return console.log(err);
				resolve(nextFileNumber);
			});
		});
	});
}

main();


