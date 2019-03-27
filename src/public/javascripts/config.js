/*
Author: Eric Udlis
Purpose: Read and Write to the Constants File
*/
const fs = require('fs');
const path = require('path');

let constants;

function getConstantsPath() {
  return path.join(__dirname, '/../../constants.json');
}

function getJSON() {
  let configPath = getConstantsPath();
  let configFile = fs.readFileSync(configPath, () => {
    console.info('Config Loaded');
  });
  return configFile;
}

function readJSON() {
  let configFile = getJSON();
  let configContent = JSON.parse(configFile);
  return configContent;
}

function updateConstants() {
  constants = readJSON();
  module.exports.constants = constants;
}

function writeJSON(obj) {
  let configPath = getConstantsPath();
  fs.writeFile(configPath, JSON.stringify(obj), () => {
    updateConstants();
  });
}

module.exports.updateConstants = updateConstants;
module.exports.writeJSON = writeJSON;

updateConstants();
