/*
Author: Eric Udlis
Purpose: Interface with the local tempory database and long term database
*/
const events = require('events');
const fs = require('fs');
const storedData = require('../../database.json');
let cache = require('../../cache');
let dataRecording = require('../../dataRecording');

const packetHandler = new events.EventEmitter();
module.exports.packetHandler = packetHandler;

// Data recording variable
module.exports.isDataRecording = false;
// Changes the data recording variable from the handler
const recordingEvent = new events.EventEmitter();
module.exports.recordingEvent = recordingEvent;
// Sets that data is recording
recordingEvent.on(true, () => {
  isDataRecording = true;
  module.exports.isDataRecording = isDataRecording;
});
// Sets that data is not recording
recordingEvent.on(false, () => {
  isDataRecording = false;
  module.exports.isDataRecording = isDataRecording;
});

// Creates cache based off of database.JSON
module.exports.createCache = function createCache(name) { // eslint-disable-line no-unused-vars
  console.log('Creating cache');
  if (name === dataRecording) {
    try {
      let subsystemsArray = Object.keys(storedData);
      for (let i = 0; i < subsystemsArray.length; i += 1) {
        let sensorsArray = Object.keys(storedData[subsystemsArray[i]]);
        dataRecording[subsystemsArray[i]] = {};
        for (let z = 0; z < sensorsArray.length; z += 1) {
          dataRecording[subsystemsArray[i]][sensorsArray[z]] = [];
        }
      }
    } catch (error) {
      console.error('dataRecording was not found');
    }
  } else {
    try {
      let subsystemsArray = Object.keys(storedData);
      for (let i = 0; i < subsystemsArray.length; i += 1) {
        let sensorsArray = Object.keys(storedData[subsystemsArray[i]]);
        cache[subsystemsArray[i]] = {};
        for (let z = 0; z < sensorsArray.length; z += 1) {
          cache[subsystemsArray[i]][sensorsArray[z]] = [];
        }
      }
    } catch (error) {
      console.error('cache was not found');
    }
  }
};

function getMaxMotorControllerTemp(input) {
  let fixedPacket = input;
  // console.log(`${input.motor.controlBoardTemp} | ${input.motor.gateDriverBoardTemp}
  // | ${input.motor.phaseAIGBTTemp}`);
  // fixedPacket.motor.maxControllerTemp = Math.max(Number(input.motor.controlBoardTemp),
  //   Number(input.motor.gateDriverBoardTemp), Number(input.phaseAIGBTTemp));

  fixedPacket.motor.maxControllerTemp = input.motor.controlBoardTemp;
  return fixedPacket;
}

function getPowerConsumed(input) {
  let fixedPacket = input;

  let power = input.battery.packCurrent * input.battery.packVoltage;
  fixedPacket.battery.packPowerConsumed = power;
  return fixedPacket;
}

function getPackPowerRemaining(input) {
  let fixedPacket = input;
  let ampHours = 6; // Got this value from Shelby
  let wattHours = input.battery.packVoltage * ampHours * input.battery.packSOC;
  fixedPacket.battery.packPowerRemaining = wattHours;

  return fixedPacket;
}

function getAbsoluteSpeed(input) {
  let fixedPacket = input;
  fixedPacket.motor.motorSpeed = -input.motor.motorSpeed;
  return fixedPacket;
}

function interpolateLVSOC(x) {
  // From LV Pack SOC spreadsheet
  let y = 1.1142 * (x ** 6) + 78.334 * (x ** 5) - 2280.5 * (x ** 4)
    + 35181 * (x ** 3) - 404340 * (x ** 2) + 1000000 * x + 3000000;
  return Number(y);
}

function getLVSOC(input) { // eslint-disable-line no-unused-vars
  let fixedPacket = input;
  let x = Number(input.battery.lvVoltage);
  let lvSOC = interpolateLVSOC(x);
  fixedPacket.battery.lvSOC = lvSOC;

  return fixedPacket;
}

function ambientToGauge(input) { // eslint-disable-line no-unused-vars
  let fixedPacket = input;

  fixedPacket.braking.primaryTank = input.braking.primaryTank + 14.7;
  fixedPacket.braking.primaryLine = input.braking.primaryLine + 14.7;
  fixedPacket.braking.primaryActuation = input.braking.primaryActuation + 14.7;
  fixedPacket.braking.secondaryTank = input.braking.secondaryTank + 14.7;
  fixedPacket.braking.secondaryLine = input.braking.secondaryLine + 14.7;
  fixedPacket.braking.secondaryActuation = input.braking.secondaryActuation + 14.7;

  return fixedPacket;
}
function updateData(dataIn, name) {
  // Sort through the data and append the new values to their respective arrays in cache.js
  // NormalizePacket -> Calculations -> [UpdateData]
  const groups = Object.keys(dataIn);
  groups.forEach((group) => {
    const sensors = Object.keys(dataIn[group]);
    sensors.forEach((sensor) => {
      try {
        const input = Number(dataIn[group][sensor]);
        const target = name[group][sensor];
        let temp;
        if (group === 'braking') {
          temp = input.toFixed(0);
          // console.log(' braking');
        } else {
          temp = input.toFixed(3);
          if (sensor === 'imdStatus' && input === 0) temp = 'Off';
          if (sensor === 'imdStatus' && input === 1) temp = 'On';
          // console.log(' else');
        }
        target.push(temp);
      } catch (error) {
        // console.error(`Error: Sensor ${sensor} in ${group} not found in cache`);
      }
    });
  });
}

function calculate(input) {
  // Any Calcuations that need to be done prior to RECORDING should be done here
  // NormalizePacket ->  [Calculations] -> UpdateData
  let fixedPacket = input;
  // Take the Max of the three motor controller temp sensors and put the max in maxControllerTemp
  try {
    // if (input.braking) fixedPacket = ambientToGauge(fixedPacket);
    if (input.battery) {
      fixedPacket = getPowerConsumed(fixedPacket);
      fixedPacket = getPackPowerRemaining(fixedPacket);
      // fixedPacket = getLVSOC(fixedPacket);
    }
    if (input.motion) {} // eslint-disable-line
    if (input.motor) {
      fixedPacket = getMaxMotorControllerTemp(fixedPacket);
      fixedPacket = getAbsoluteSpeed(fixedPacket);
    }
  } catch (err) {
    // console.error(`Calculation Error: ${err}`);
  }
  // Put the new data in the cache
  updateData(fixedPacket, cache);
  if (this.isDataRecording) {
    updateData(fixedPacket, dataRecording);
  }
}

module.exports.normalizePacket = function normalizePacket(input) {
  // Read and remove anything from the packet that is not data
  // Any calculations that need to be done before prior to RECORDING the data should be done here
  // [NormalizePacket] -> Calcuations -> UpdateData
  const { state } = input;
  let fixedPacket = input;
  // console.info('Incomming Packet:');
  // console.info(input);
  if (state) {
    if (!(state >= 11 && state <= 13)) {
      dl.switchState(state);
    } else dl.setFault(state);
    delete fixedPacket.state;
  }

  if (input.battery) {
    delete fixedPacket.battery.cells;
    delete fixedPacket.battery.minCellTemp;
    delete fixedPacket.battery.avgCellTemp;
  }
  // Move packet to UpdateData
  calculate(fixedPacket);
};

module.exports.findRenderable = function findRenderable() {
  let renderable = storedData;
  let subsystems = Object.keys(renderable);
  subsystems.forEach((subsystem) => {
    sensors = Object.keys(renderable[subsystem]);
    sensors.forEach((sensor) => {
      let currentLocaton = renderable[subsystem][sensor];
      if (!currentLocaton.show) delete renderable[subsystem][sensor];
    });
  });
  return renderable;
};

// Exporting
function createID() {
  let d = new Date();
  return `${d.getDate()}${d.getHours()}${d.getMinutes()}${d.getSeconds()}`;
}

function createJSON(name) {
  fs.writeFileSync(`./Exports/${name}.json`, JSON.stringify(dataRecording), (err) => {
    if (err) throw err;
    console.log(`${name}.json Created!`);
  });
}

module.exports.archiveData = function archiveData(name) {
  if (name) createJSON(name);
  else createJSON(createID());
};
