/**
 * @module Data-Interfacing
 * @author Eric Udlis, Zander Huang
 * @description Interface with the local tempory cache and long term recording
 */

const EVENTS = require('events');
const FS = require('fs');

/** @requires module:jsons-database */
const STORED_DATA = require('../../database.json');

/** @requires module:cache */
const CACHE = require('../../cache');

/** @requires module:Recording */
const DATA_RECORDING = require('../../dataRecording');

const PACKET_HANDLER = new EVENTS.EventEmitter();
module.exports.packetHandler = PACKET_HANDLER;

module.exports.isDataRecording = false;

/** @constant - Changes the data recording variable from the handler */
const RECORDING_EVENT = new EVENTS.EventEmitter();
module.exports.recordingEvent = RECORDING_EVENT;

// Sets that data is recording
RECORDING_EVENT.on('on', () => {
  isDataRecording = true;
  module.exports.isDataRecording = isDataRecording;
});

// Sets that data is not recording
RECORDING_EVENT.on('off', () => {
  isDataRecording = false;
  module.exports.isDataRecording = isDataRecording;
});

/**
 * Creates a cache based off of database.JSON
 */
module.exports.createCache = function createCache(name) { // eslint-disable-line no-unused-vars
  console.log('Creating cache');
  if (name === DATA_RECORDING) { // creates dataRecording cache
    try {
      let subsystemsArray = Object.keys(STORED_DATA);
      for (let i = 0; i < subsystemsArray.length; i += 1) {
        let sensorsArray = Object.keys(STORED_DATA[subsystemsArray[i]]);
        DATA_RECORDING[subsystemsArray[i]] = {};
        for (let z = 0; z < sensorsArray.length; z += 1) {
          DATA_RECORDING[subsystemsArray[i]][sensorsArray[z]] = [];
        }
      }
    } catch (error) {
      console.error('dataRecording was not found');
    }
  } else { // creates dashboard cache
    try {
      let subsystemsArray = Object.keys(STORED_DATA);
      for (let i = 0; i < subsystemsArray.length; i += 1) {
        let sensorsArray = Object.keys(STORED_DATA[subsystemsArray[i]]);
        CACHE[subsystemsArray[i]] = {};
        for (let z = 0; z < sensorsArray.length; z += 1) {
          CACHE[subsystemsArray[i]][sensorsArray[z]] = [];
        }
      }
    } catch (error) {
      console.error('cache was not found');
    }
  }
};

/**
 * Modifies packet to fill maxControllerTemp flag
 * @param {Object} input Input Packet
 * @returns {Object} The modified packet
 */
function getMaxMotorControllerTemp(input) {
  let fixedPacket = input;
  // console.log(`${input.motor.controlBoardTemp} | ${input.motor.gateDriverBoardTemp}
  // | ${input.motor.phaseAIGBTTemp}`);
  // fixedPacket.motor.maxControllerTemp = Math.max(Number(input.motor.controlBoardTemp),
  //   Number(input.motor.gateDriverBoardTemp), Number(input.phaseAIGBTTemp));

  fixedPacket.motor.maxControllerTemp = input.motor.controlBoardTemp;
  return fixedPacket;
}

/**
 * Modifies packet to fill packPowerConsumed flag
 * @param {Object} input Input Packet
 * @returns {Object} - The Modified packet
 */
function getPowerConsumed(input) {
  let fixedPacket = input;

  let power = input.battery.packCurrent * input.battery.packVoltage;
  fixedPacket.battery.packPowerConsumed = power;
  return fixedPacket;
}

/**
 * Modifies packet to fill packPowerRemaining flag
 * @param {Object} input Input packet
 * @returns {Object} - The modified packet
 */
function getPackPowerRemaining(input) {
  let fixedPacket = input;
  let ampHours = 6; // Got this value from Shelby
  let wattHours = input.battery.packVoltage * ampHours * input.battery.packSOC;
  fixedPacket.battery.packPowerRemaining = wattHours;

  return fixedPacket;
}
/**
 * Modifies packet to invert speed of motor
 * @param {Object} input Input packet
 * @returns {Object} - THe modified packet
 */
function getAbsoluteSpeed(input) {
  let fixedPacket = input;
  fixedPacket.motor.motorSpeed = -input.motor.motorSpeed;
  return fixedPacket;
}

/**
 * Calculates the LV batteries State of Charge
 * @param {Number} x - Voltage of LV Battery
 * @returns {Number} - The pack's state of charge
 */
function interpolateLVSOC(x) {
  // From LV Pack SOC spreadsheet
  let y = 1.1142 * (x ** 6) + 78.334 * (x ** 5) - 2280.5 * (x ** 4)
    + 35181 * (x ** 3) - 404340 * (x ** 2) + 1000000 * x + 3000000;
  return Number(y);
}

/**
 * Modifies packet to fill LVSOC flag
 * @param {Object} input The input packet
 * @returns {Object} - The modified packet
 */
function getLVSOC(input) { // eslint-disable-line no-unused-vars
  let fixedPacket = input;
  let x = Number(input.battery.lvVoltage);
  let lvSOC = interpolateLVSOC(x);
  fixedPacket.battery.lvSOC = lvSOC;

  return fixedPacket;
}
/**
 * Converts ambient pressure reading to gauge pressure readings
 * @param {Object} input The input packet
 * @returns {Object} - The modified packet
 */
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

/**
 * @description Sort through the data and append the new values to their respective
 * arrays in cache.js
 * NormalizePacket -> Calculations -> [UpdateData]
 * @param {Object} dataIn The packet to process
 * @param {String} location The location you're writing to
 */
function updateData(dataIn, location) {
  const groups = Object.keys(dataIn);
  groups.forEach((group) => {
    const sensors = Object.keys(dataIn[group]);
    sensors.forEach((sensor) => {
      try {
        const input = Number(dataIn[group][sensor]);
        const target = location[group][sensor];
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
/**
 *  Any Calcuations that need to be done prior to RECORDING should be done here
 *  NormalizePacket ->  [Calculations] -> UpdateData
 * @param {Object} input Packet to process
 */
function calculate(input) {
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
  updateData(fixedPacket, CACHE);
  if (this.isDataRecording) {
    updateData(fixedPacket, DATA_RECORDING);
  }
}

/**
 * Read and remove anything from the packet that is not data
 * Any calculations that need to be done before prior to RECORDING the data should be done here
 * [NormalizePacket] -> Calcuations -> UpdateData
 * @param {Object} input - The packet to process
 */
module.exports.normalizePacket = function normalizePacket(input) {
  const { state } = input;
  let fixedPacket = input;
  // console.info('Incomming Packet:');
  // console.info(input);
  if (state) {
    if (!(state >= 11 && state <= 13)) {
      DYNAMIC_LOADING.switchState(state);
    } else DYNAMIC_LOADING.setFault(state);
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

/**
 * Finds subsystems in database that are renderable returns that list
 * @returns {Object} - List of renderable sensors
 */
module.exports.findRenderable = function findRenderable() {
  let renderable = STORED_DATA;
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

/**
 * Creates the ID for the file
 */
function createID() {
  let d = new Date();
  return `${d.getMonth() + 1}-${d.getDate()}--${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
}

/**
 * Writes export to file
 * @param {String} name - The name of the export file
 */
function createJSON(name) {
  console.log(JSON.stringify(DATA_RECORDING));
  FS.writeFileSync(`./Exports/${name}.json`, JSON.stringify(DATA_RECORDING), (err) => {
    if (err) throw err;
    console.log(`${name}.json Created!`);
  });
}
/**
 * Creates archive file with name or id
 * @param {String} name - The name of the file to export
 */
module.exports.archiveData = function archiveData(name) {
  if (name) createJSON(name);
  else createJSON(createID());
};
