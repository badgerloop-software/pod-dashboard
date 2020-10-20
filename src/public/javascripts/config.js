/**
 * @module Config
 * @author Eric Udlis
 * @description Read and Write to the constants file
 * @see module:jsons-constants
 */

const fs = require('fs');
const path = require('path');

let constants;
/**
 * @returns {String} - Absolute directory of constants.json
 */
function getConstantsPath() {
    return path.join(__dirname, '/../../constants.json');
}

/**
 * @returns {File} - Constants file
 */
function getJSONFile() {
    let configPath = getConstantsPath();
    let configFile = fs.readFileSync(configPath, () => {
        console.info('Config Loaded');
    });
    return configFile;
}

/**
 * @returns {JSON} - Contents of config file
 */
function readJSON() {
    let configFile = getJSONFile();
    let configContent = JSON.parse(configFile);
    return configContent;
}

/**
 * Reads the file and updates export accordingly
 */
function updateConstants() {
    constants = readJSON();
    module.exports.constants = constants;
}

/**
 * Writes new constants JSON to file
 * @param {JSON} obj The JSON object of new constnats file
 */
function writeJSON(obj) {
    let configPath = getConstantsPath();
    fs.writeFileSync(configPath, JSON.stringify(obj));
    return 'File Successfully Written';
}

/** @see updateConstants() */
module.exports.updateConstants = updateConstants;
/** @see writeJSON() */
module.exports.writeJSON = writeJSON;

updateConstants();
