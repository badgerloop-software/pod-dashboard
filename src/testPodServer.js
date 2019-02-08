/*
Author: Eric Udlis
Purpose: Test File to Send UDP Packets to the dashboard containing random numbers as data
*/
const dgram = require('dgram');
const constants = require('./constants');

const DATA_SEND_RATE = 30;
const IP = '127.0.0.1';
const PORT = constants.serverAddr.port;
const client = dgram.createSocket('udp4');

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

function sendTestData() {
  const testSocket = {
    type: 'data',
    data: {
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
        packAH: getRandomValue(),
        cellMaxVoltage: getRandomValue(),
        cellMinVoltage: getRandomValue(),
        highTemp: getRandomValue(),
        lowTemp: getRandomValue(),
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
    },
  };
  sendJSON(testSocket);
}

// The line where test data is sent. setInterval(function, ms)
//

setInterval(sendTestData, DATA_SEND_RATE);
