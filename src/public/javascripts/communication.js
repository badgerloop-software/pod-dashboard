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
  const recieved = JSON.parse(message); // Turn String into JSON
  recievedEmitter.emit('dataIn', recieved); // Send it to handler.js
});

udpServer.bind(PORT, HOST);

function sendPacket(ip, port, msg) {
  const tcpSender = new net.Socket();
  tcpSender.connect(port, ip, () => {
    // console.log('Connection opened');
    console.log(`Sending ${msg} to ${ip}`);
    tcpSender.write(msg);
  });

  tcpSender.setTimeout(2000);
  tcpSender.on('data', (e) => {
    console.log(`Recieved: ${e}`);
    recievedEmitter.emit('ok', ip);
  });

  tcpSender.on('error', (e) => { // eslint-disable-line no-unused-vars
    // console.error(e); // Commented out for dev without beaglebone connected
    recievedEmitter.emit('Lost', ip);
  });

  tcpSender.on('close', () => {
    // console.log('Connection Closed'); // Commented out for dev without beaglebone connected
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

module.exports.sendOverride = function sendOverride(state) {
  sendHVCommand(`override-${state}`);
};

module.exports.sendLVPing = function sendLVPing() {
  sendLVCommand('ping');
};

module.exports.sendHVPing = function sendHVPing() {
  sendHVCommand('ping');
};

module.exports.enableHV = function enableHV() {
  sendHVCommand('hvEnable');
};

module.exports.disableHV = function disableHV() {
  console.log('sending tcp');
  sendHVCommand('hvDisable');
};

module.exports.primBrakeOff = function primBrakeOff() {
  sendLVCommand('primBrakeOff');
};

module.exports.primBrakeOn = function primBrakeOn() {
  sendLVCommand('primBrakeOn');
};

module.exports.secBrakeOn = function secBrakeOn() {
  sendLVCommand('secBrakeOn');
};

module.exports.secBrakeOff = function secBrakeOn() {
  sendLVCommand('secBrakeOff');
};

module.exports.enPrecharge = function enPrecharge() {
  sendHVCommand('enPrecharge');
};

module.exports.toggleLatch = function toggleLatch(state) {
  if (state) sendHVCommand('mcuLatchOn');
  else sendHVCommand('mcuLatchOff');
};

module.exports.commandTorque = function commandTorque() {
  sendHVCommand('cmdTorque');
};

module.exports.toggleSafety = function toggleSafety(state) {
  if (state) {
    sendHVCommand('safetyOn');
  } else {
    sendHVCommand('safetyOff');
  }
};
