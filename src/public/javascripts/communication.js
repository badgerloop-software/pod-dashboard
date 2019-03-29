/*
Author: Eric Udlis
Purpose: The hub of all incomming and outgoing connections
*/
const events = require('events');
const dgram = require('dgram');
const net = require('net');

const { constants } = require('./config');

const udpServer = dgram.createSocket('udp4');
const PORT = constants.serverAddr.port;
const HOST = constants.serverAddr.ip;
const LV_BONE_IP = constants.lvBone.ip;
const LV_BONE_PORT = constants.lvBone.port;
const HV_BONE_IP = constants.hvBone.ip;
const HV_BONE_PORT = constants.hvBone.port;
const recievedEmitter = new events.EventEmitter();
module.exports.recievedEmitter = recievedEmitter;

// UDP Data Recieving

udpServer.on('listening', () => {
  const address = udpServer.address();
  console.log(`UDP Server listening on ${address.address}:${address.port}`);
});

udpServer.on('message', (message) => {
  const recieved = JSON.parse(message);
  module.exports.inData = recieved;
  // Emit to handler.js that data has been recieved
  recievedEmitter.emit('dataIn');
});

udpServer.bind(PORT, HOST);

function sendPacket(ip, port, msg) {
  const tcpSender = new net.Socket();
  tcpSender.connect(port, ip, () => {
    console.log('Pod Connected');
    tcpSender.write(msg);
  });

  tcpSender.setTimeout(2000);

  tcpSender.on('data', (e) => {
    console.log(`Recieved: ${e}`);
  });

  tcpSender.on('error', () => {
    // console.error(e);  // Commented out for dev without beaglebone connected
    recievedEmitter.emit('Lost', ip);
  });

  tcpSender.on('close', () => {
    // console.log('Connection Closed'); //Commented out for dev without beaglebone connected
  });
}

module.exports.sendPacket = sendPacket;

function sendLVCommand(msg) {
  return sendPacket(LV_BONE_IP, LV_BONE_PORT, msg);
}

module.exports.sendLVCommand = sendLVCommand;

function sendHVCommand(msg) {
  return sendPacket(HV_BONE_IP, HV_BONE_PORT, msg);
}

module.exports.sendHVCommand = sendHVCommand;

module.exports.sendReadyPump = function sendReadyPump() {
  sendHVCommand('readypump');
};

module.exports.sendPumpDown = function sendPumpDown() {
  sendHVCommand('pumpDown');
};

module.exports.sendReadyCommand = function sendReadyCommand() {
  sendHVCommand('readyCommand');
};

module.exports.sendPropulse = function sendPropulse() {
  sendHVCommand('propulse');
};

module.exports.sendEBrake = function sendEBrake() {
  sendHVCommand('emergencyBrake');
};

module.exports.sendLVPing = function sendLVPing() {
  sendLVCommand('ping');
};

module.exports.sendHVPing = function sendHVPing() {
  sendHVCommand('ping');
};
