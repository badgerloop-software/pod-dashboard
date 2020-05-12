/**
* @module Communication
* @author Eric Udlis
* @description The hub of all incomming and outgoing connections
*/
const EVENTS = require('events');
const DGRAM = require('dgram');
const NET = require('net');

const { constants: CONSTANTS } = require('./config');

const UDP_SERVER = DGRAM.createSocket('udp4');
const PORT = CONSTANTS.serverAddr.port;
const HOST = CONSTANTS.serverAddr.ip;
const LV_BONE_IP = CONSTANTS.lvBone.ip;
const LV_BONE_PORT = CONSTANTS.lvBone.port;
const HV_BONE_IP = CONSTANTS.hvBone.ip;
const HV_BONE_PORT = CONSTANTS.hvBone.port;
const RECIEVING_EMITTER = new EVENTS.EventEmitter();
module.exports.recievedEmitter = RECIEVING_EMITTER;

// UDP Data Recieving

UDP_SERVER.on('listening', () => {
  const address = UDP_SERVER.address();
  console.log(`UDP Server listening on ${address.address}:${address.port}`);
});

UDP_SERVER.on('message', (message) => {
  const recieved = JSON.parse(message); // Turn String into JSON
  RECIEVING_EMITTER.emit('dataIn', recieved); // Send it to handler.js
});

UDP_SERVER.bind(PORT, HOST);

/**
 * Sends a packet to given ip and port over TCP
 * @param {String} ip IP to send packet to
 * @param {*} port Port to send packet to
 * @param {*} msg  Message to include in packet
 */
function sendPacket(ip, port, msg) {
  const tcpSender = new NET.Socket();
  tcpSender.connect(port, ip, () => {
    // console.log('Connection opened');
    console.log(`Sending ${msg} to ${ip}`);
    tcpSender.write(msg);
  });

  tcpSender.setTimeout(2000);
  tcpSender.on('data', (e) => {
    console.log(`Recieved: ${e}`);
    RECIEVING_EMITTER.emit('ok', ip);
  });

  tcpSender.on('error', (e) => { // eslint-disable-line no-unused-vars
    RECIEVING_EMITTER.emit('Lost', ip);
  });

  tcpSender.on('close', () => {
    // console.log('Connection Closed'); // Commented out for dev without beaglebone connected
  });
}

module.exports.sendPacket = sendPacket;
/**
 * Sends a message to the LV beaglebone
 * @param {String} msg Message to send
 */
function sendLVCommand(msg) {
  return sendPacket(LV_BONE_IP, LV_BONE_PORT, msg);
}

module.exports.sendLVCommand = sendLVCommand;
/**
 * Sends a message to the HV beaglebon
 * @param {String} msg Message to send
 */
function sendHVCommand(msg) {
  return sendPacket(HV_BONE_IP, HV_BONE_PORT, msg);
}

module.exports.sendHVCommand = sendHVCommand;
/**
 * Sends ready for pumpdown command
 */
module.exports.sendReadyPump = function sendReadyPump() {
  sendHVCommand('readypump');
};

/**
 * Sends pumpdown command
 */
module.exports.sendPumpDown = function sendPumpDown() {
  sendHVCommand('pumpDown');
};

/**
 * Sends Ready for pumpdown command
 */
module.exports.sendReadyCommand = function sendReadyCommand() {
  sendHVCommand('readyCommand');
};

/**
 * Sends Propulsion command
 */
module.exports.sendPropulse = function sendPropulse() {
  sendHVCommand('propulse');
};
/**
 * Sends Emergency Brake Command
 */
module.exports.sendEBrake = function sendEBrake() {
  sendHVCommand('emergencyBrake');
};

/**
 * Sends Override state command
 */
module.exports.sendOverride = function sendOverride(state) {
  sendHVCommand(`override-${state}`);
};

/**
 * Sends ping message to LV beaglebone
 */
module.exports.sendLVPing = function sendLVPing() {
  sendLVCommand('ping');
};

/**
 * Sends ping message to HV beaglebone
 */
module.exports.sendHVPing = function sendHVPing() {
  sendHVCommand('ping');
};

/**
 * Sends enable HV command
 */
module.exports.enableHV = function enableHV() {
  sendHVCommand('hvEnable');
};

/**
 * Sends disable HV command
 */
module.exports.disableHV = function disableHV() {
  sendHVCommand('hvDisable');
};

/**
 * Sends primary brake off command
 */
module.exports.primBrakeOff = function primBrakeOff() {
  sendLVCommand('primBrakeOff');
};

/**
 * Send primary brake on command
 */
module.exports.primBrakeOn = function primBrakeOn() {
  sendLVCommand('primBrakeOn');
};

/**
 * Sends Secondary brake on command
 */
module.exports.secBrakeOn = function secBrakeOn() {
  sendLVCommand('secBrakeOn');
};

/**
 * Sends secondary brake off command
 */
module.exports.secBrakeOff = function secBrakeOn() {
  sendLVCommand('secBrakeOff');
};

/**
 * Send precharge enable command
 */
module.exports.enPrecharge = function enPrecharge() {
  sendHVCommand('enPrecharge');
};

/**
 * Sends toggle latch command
 * @param state true for on false for off
 */
module.exports.toggleLatch = function toggleLatch(state) {
  if (state) sendHVCommand('mcuLatchOn');
  else sendHVCommand('mcuLatchOff');
};

/**
 * Sends command torque command
 */
module.exports.commandTorque = function commandTorque() {
  sendHVCommand('cmdTorque');
};

/**
 * Sends toggle safety command
 * @param state true of on false for off
 */
module.exports.toggleSafety = function toggleSafety(state) {
  if (state) {
    sendHVCommand('safetyOn');
  } else {
    sendHVCommand('safetyOff');
  }
};
