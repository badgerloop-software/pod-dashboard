/*
Author: Eric Udlis
Purpose: Test File to Send UDP Packets to the dashboard containing random numbers as data
*/
const dgram = require('dgram');
const constants = require('./constants');

const DATA_SEND_RATE = constants.dataSendRate;
const IP = '127.0.0.1';
const PORT = constants.serverAddr.port;
const client = dgram.createSocket('udp4');
let counter = 0;

function getRandomIntInclusive(min, max) {
  const myMin = Math.ceil(min);
  const myMax = Math.floor(max);
  // The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (myMax - myMin + 1)) + min;
}

function getRandomValue() {
  return getRandomIntInclusive(0, 255);
}

function heartbeat() { // eslint-disable-line no-unused-vars
  client.send('ping', 0, 'ping'.length, PORT, IP, (err) => {
    if (err) throw err;
    console.log('ping');
  });
}

function sendData(data) {
  client.send(data, 0, data.length, PORT, IP, (err) => {
    if (err) throw err;
  });
}

function sendJSON(object) {
  console.log('send data');
  sendData(JSON.stringify(object));
}

function sendTestData() { // eslint-disable-line
  const testSocket = {
    state: 1,
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
      controllerBoardTemp: getRandomValue(),
      gateDriverBoardTemp: getRandomValue(),
      motorPhaseAIGBTTemp: getRandomValue(),
    },
  };
  sendJSON(testSocket);
}

function sendSpecificData(data) {
  let testSocket = {
    state: 2,
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

function sendSinusodalData() { // eslint-disable-line no-unused-vars
  let increase = Math.PI * 2 / 100;
  let y = Math.sin(counter) / 2 + 0.5;
  sendSpecificData(y);
  counter += increase;
}

// The line where test data is sent. setInterval(function, ms)

// Send random data
// setInterval(sendTestData, DATA_SEND_RATE);

// Send Sinusodial Data
setInterval(sendSinusodalData, DATA_SEND_RATE);
