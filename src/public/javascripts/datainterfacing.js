/*
Author: Eric Udlis
Purpose: Interface with the local tempory database and long term database
*/
const events = require('events');
const fs = require('fs');
const storedData = require('../../database.json');
let cache = require('../../cache');

const packetHandler = new events.EventEmitter();
module.exports.packetHandler = packetHandler;

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

function getNegatedSpeed(input) {
  let fixedPacket = input;
  fixedPacket.motor.motorSpeed = -input.motor.motorSpeed;
  return fixedPacket;
}

function interpolateLVSOC(x) {
  // From LV Pack SOC spreadsheet
  // equation y= -2e^10x^6 + 6e^-8x^5 - 9e^-6x^4 + 0.0006x^3- 0.0195x^2 +0.3159x + 8.9316

  let y = -(0.0000000002) * (x ** 6) + 0.00000006 * (x ** 5) - 0.000009 * (x ** 4)
  + 0.0006 * (x ** 3) - 0.0195 * (x ** 2) + 0.3159 * x + 8.9316;

  return Number(y);
}

function getLVSOC(input) {
  let fixedPacket = input;
  let x = Number(input.battery.batteryVoltage);
  let lvSOC = interpolateLVSOC(x);
  fixedPacket.battery.lvSOC = lvSOC;

  return fixedPacket;
}

function ambientToGauge(input) {
  let fixedPacket = input;

  fixedPacket.braking.primaryTank = input.braking.primaryTank + 14.7;
  fixedPacket.braking.primaryLine = input.braking.primaryLine + 14.7;
  fixedPacket.braking.primaryActuation = input.braking.primaryActuation + 14.7;
  fixedPacket.braking.secondaryTank = input.braking.secondaryTank + 14.7;
  fixedPacket.braking.secondaryLine = input.braking.secondaryLine + 14.7;
  fixedPacket.braking.secondaryActuation = input.braking.secondaryActuation + 14.7;

  return fixedPacket;
}
function updateData(dataIn) {
  // Sort through the data and append the new values to their respective arrays in cache.js
  // NormalizePacket -> Calculations -> [UpdateData]
  const groups = Object.keys(dataIn);
  groups.forEach((group) => {
    const sensors = Object.keys(dataIn[group]);
    sensors.forEach((sensor) => {
      try {
        const input = Number(dataIn[group][sensor]);
        const target = cache[group][sensor];
        const temp = input.toFixed(3);
        target.push(temp);
      } catch (error) {
        console.error(`Error: Sensor ${sensor} in ${group} not found in cache`);
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
    fixedPacket = getMaxMotorControllerTemp(fixedPacket);
    fixedPacket = getPowerConsumed(fixedPacket);
    fixedPacket = getPackPowerRemaining(fixedPacket);
    fixedPacket = getLVSOC(fixedPacket);
    fixedPacket = getNegatedSpeed(fixedPacket);
    fixedPacket = ambientToGauge(fixedPacket);
  } catch (err) {
    console.error(`Calculation Error: ${err}`);
  }
  // Put the new data in the cache
  updateData(fixedPacket);
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
