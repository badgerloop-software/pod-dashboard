const fs = require('fs');
const path = require('path');

let constants;


function readJSON() {
  let configPath = path.join(__dirname, '/../../constants.json');
  let configFile = fs.readFileSync(configPath, () => {
    console.info('Config Loaded');
  });
  let configContent = JSON.parse(configFile);
  return configContent;
}

function updateJSON() {
  constants = readJSON();
  module.exports.constants = constants;
}

module.exports.updateJSON = updateJSON;
updateJSON();
