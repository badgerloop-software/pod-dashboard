/*
Author: Eric Udlis
Purpose: The hub of all incomming and outgoing connections
*/
const events = require('events');
const dgram = require('dgram');
const net = require('net');
const constants = require('../../constants');

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
  switch (recieved.type) {
    case 'data':
      module.exports.inData = recieved;
      // Emit to handler.js that data has been recieved
      recievedEmitter.emit('dataIn');
      break;
    case 'disconnect':
      recievedEmitter.emit('disconnect'[recieved.subsystem]);
      break;

    default:
      console.log(message);
  }
});

recievedEmitter.on('heartbeat', () => {
  console.log('pong');
});

udpServer.bind(PORT, HOST);

module.exports.sendPacket = function sendPacket(ip, port, msg) {
  const tcpSender = new net.Socket();
  tcpSender.connect(port, ip, () => {
    console.log('Pod Connected');
    tcpSender.write(msg);
  });

  tcpSender.setTimeout(2000);

  tcpSender.on('data', (e) => {
    console.log(`Recieved: ${e}`);
  });

  tcpSender.on('close', () => {
    console.log('Connection Closed');
  });
};

module.exports.sendLVCommand = function sendLVCommand(msg) {
  sendPacket(LV_BONE_IP, LV_BONE_PORT, msg);
};

module.exports.sendHVCommand = function sendHVCommand(msg) {
  sendPacket(HV_BONE_IP, HV_BONE_PORT, msg);
};
