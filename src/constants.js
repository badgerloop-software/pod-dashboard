/*
Author: Eric Udlis
Purpose: Store all constants in one place
*/
module.exports = {
  dataSendRate: 100,
  serverAddr: {
    ip: '0.0.0.0',
    port: 33333,
  },
  hvBone: {
    ip: '192.168.1.140',
    port: 9091,
  },
  lvBone: {
    ip: '192.168.1.147',
    port: 9091,
  },
  scanningRate: 300,
  mins: {
    off: {},
    idle: {},
    readyForPumpdown: {},
    pumpdown: {},
    ready: {},
    postRun: {},
    crawl: {},
  },
  maxs: {
    off: {},
    idle: {},
    readyForPumpdown: {},
    pumpdown: {},
    ready: {},
    postRun: {},
    crawl: {},
  },
};
