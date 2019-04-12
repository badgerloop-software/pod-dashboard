/*
Author: Eric Udlis
Purpose: Interface with the local tempory database and long term database
*/
const events = require('events');
const fs = require('fs');
const storedData = require('../../database.json');
let cache = require('../../cache');

const updater = new events.EventEmitter();
module.exports.updater = updater;

// Creates cache based off of database.JSON
module.exports.createCache = function createCache() { // eslint-disable-line no-unused-vars
  console.log('Creating Cache');
  let subsystemsArray = Object.keys(storedData);
  for (let i = 0; i < subsystemsArray.length; i += 1) {
    let sensorsArray = Object.keys(storedData[subsystemsArray[i]]);
    cache[subsystemsArray[i]] = {};
    for (let z = 0; z < sensorsArray.length; z += 1) {
      cache[subsystemsArray[i]][sensorsArray[z]] = [];
    }
  }
};

module.exports.updateData = function updateData(dataIn) {
  // Sort through the data and append the new values to their respective arrays in cache.js
  // NormalizePacket -> [UpdateData] -> RenderData
  const groups = Object.keys(dataIn);
  groups.forEach((group) => {
    const sensors = Object.keys(dataIn[group]);
    sensors.forEach((sensor) => {
      try {
        const input = Number(dataIn[group][sensor]);
        const target = cache[group][sensor];
        const temp = input.toFixed(5);
        target.push(temp);
      } catch (error) {
        console.error(`Error: Sensor ${sensor} in ${group} not found`);
      }
    });
  });
  // Tell proto.js to render the data
  updater.emit('updateData');
};

module.exports.normalizePacket = function normalizePacket(input) {
  // Read and remove anything from the packet that is not data
  // [NormalizePacket] -> UpdateData -> RenderData
  const { state } = input;
  let fixedPacket = input;
  console.info('Incomming Packet:');
  console.info(input);
  if (!(state >= 11 && state <= 13)) {
    dl.switchState(state);
  } else dl.setFault(state);
  delete fixedPacket.state;

  // Move packet to UpdateData
  updateData(fixedPacket);
};

// Exporting
function createID() {
  let d = new Date();
  return `${d.getDate()}${d.getHours()}${d.getMinutes()}`;
}

function createJSON(name) {
  fs.writeFileSync(`./Exports/${name}.json`, JSON.stringify(cache), (err) => {
    if (err) throw err;
    console.log(`${name}.json Created!`);
  });
}

module.exports.archiveData = function archiveData() {
  createJSON(createID());
};