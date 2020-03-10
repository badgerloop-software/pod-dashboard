/**
 * @module TestPodServer
 * @author Eric Udlis
 * @description Test file to send UDP packets to the dashboard
 */

const DGRAM = require('dgram');
const CONSTANTS = require('./constants');

const DATA_SEND_RATE = CONSTANTS.dataSendRate;
const IP = '127.0.0.1';
const PORT = CONSTANTS.serverAddr.port;
const CLIENT = DGRAM.createSocket('udp4');
let counter = 0;

/**
 * Gets a random integer between min and max inclusive
 * @param {Number} min Minimum number
 * @param {Number} max Maximum number
 */
function getRandomIntInclusive(min, max) {
  const myMin = Math.ceil(min);
  const myMax = Math.floor(max);
  // The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (myMax - myMin + 1)) + min;
}

/**
 * Gets a random value between 0 and 255
 */
function getRandomValue() {
  return getRandomIntInclusive(0, 255);
}

/**
 * Sends a heartbeat ping to the dashboard
 */
function heartbeat() { // eslint-disable-line no-unused-vars
  CLIENT.send('ping', 0, 'ping'.length, PORT, IP, (err) => {
    if (err) throw err;
    console.log('ping');
  });
}

/**
 * Sends a message to the dashboard over UDP
 * @param {String} data the message to send
 */
function sendData(data) {
  CLIENT.send(data, 0, data.length, PORT, IP, (err) => {
    if (err) throw err;
  });
}

/**
 * Sends an object to the dashboard over UDP
 * @param {Object} object Object to send
 */
function sendJSON(object) {
  console.log('send data');
  sendData(JSON.stringify(object));
}

/**
 * Sends a packet to the dashboard containing random data
 */
function sendTestData() { // eslint-disable-line
  const testSocket = {
    state: 1,
    time: new Date().getMilliseconds(),
    motion: {
      stoppingDistance: getRandomValue(),
      position: getRandomValue(),
      retro: getRandomValue(),
      velocity: getRandomValue(),
      acceleration: getRandomValue(),
    },
    battery: {
      packVoltage: getRandomValue(),
      packCurrent: getRandomValue(),
      packSOC: getRandomValue(),
      cellMaxVoltage: getRandomValue(),
      cellTemp: getRandomValue(),
      batteryVoltage: getRandomValue(),
    },
    braking: {
      secondaryTank: getRandomValue(),
      secondaryLine: getRandomValue(),
      secondaryActuation: getRandomValue(),
      primaryTank: getRandomValue(),
      primaryLine: getRandomValue(),
      primaryActuation: getRandomValue(),
      pressureVesselPressure: getRandomValue(),
      currentPressure: getRandomValue(),
    },
    motor: {
      commandTorque: getRandomValue(),
      torqueFeedback: getRandomValue(),
      motorSpeed: getRandomValue(),
      motorTemp: getRandomValue(),
      phaseACurrent: getRandomValue(),
      busCurrent: getRandomValue(),
      busVoltage: getRandomValue(),
      lowVoltageSystem: getRandomValue(),
      maxControllerTemp: getRandomValue(),
      controlBoardTemp: getRandomValue(),
      gateDriverBoardTemp: getRandomValue(),
      phaseAIGBTTemp: getRandomValue(),
    },
  };
  sendJSON(testSocket);
}

/**
 * Sends a specific number to the dashboard
 * @param {Number} data Data to fill in each sensor
 */
function sendSpecificData(data) {
  let testSocket = {
    state: 3,
    time: new Date().getMilliseconds(),
    motion: {
      stoppingDistance: data,
      position: data,
      retro: data,
      velocity: data,
      acceleration: data,
    },
    battery: {
      packVoltage: data,
      packCurrent: data,
      packSOC: data,
      cellMaxVoltage: data,
      cellTemp: data,
      batteryVoltage: data,
    },
    braking: {
      secondaryTank: data,
      secondaryLine: data,
      secondaryActuation: data,
      primaryTank: data,
      primaryLine: data,
      primaryActuation: data,
      pressureVesselPressure: data,
      currentPressure: data,
    },
    motor: {
      commandTorque: data,
      torqueFeedback: data,
      motorSpeed: data,
      motorTemp: data,
      phaseACurrent: data,
      busCurrent: data,
      busVoltage: data,
      lowVoltageSystem: data,
      maxControllerTemp: data,
      controlBoardTemp: data,
      gateDriverBoardTemp: data,
      phaseAIGBTTemp: data,
    },
  };
  sendJSON(testSocket);
}

/**
 * Sends sinusodial data to the dashboard
 */
function sendSinusodalData() { // eslint-disable-line no-unused-vars
  let increase = Math.PI * 2 / 100;
  let y = Math.sin(counter) / 2 + 0.5;
  sendSpecificData(y);
  counter += increase;
}

/**
 * Sends increasing data to the dashboard
 */
function sendIncreasingData() { // eslint-disable-line no-unused-vars
  let increase = 1;
  let y = counter;
  sendSpecificData(y);
  counter += increase;
}

// The line where test data is sent. setInterval(function, ms)

// Send random data
// setInterval(sendTestData, DATA_SEND_RATE);

// Send Sinusodial Data
// setInterval(sendSinusodalData, DATA_SEND_RATE);

// Send Increasing Data
setInterval(sendIncreasingData, DATA_SEND_RATE);
