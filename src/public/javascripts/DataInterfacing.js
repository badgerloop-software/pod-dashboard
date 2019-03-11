/*
Author: Eric Udlis
Purpose: Interface with the local tempory database and long term database
*/
const MongoClient = require('mongodb');
const events = require('events');
const constants = require('../../constants');
const storedData = require('../../database.json');

const updater = new events.EventEmitter();
module.exports.updater = updater;

const dbIP = constants.databaseAddr.ip;
const dbPort = constants.databaseAddr.port;

module.exports.updateData = function updateData(dataIn) {
  // Sort through the data and append the new values to their respective arrays in database.js
  const groups = Object.keys(dataIn);
  groups.forEach((group) => {
    const sensors = Object.keys(dataIn[group]);
    // console.log(i);
    sensors.forEach((sensor) => {
      const input = Number(dataIn[group][sensor]);
      const target = storedData[group][sensor].data;
      const temp = input.toFixed(5);
      target.push(temp);
    });
  });
  // Tell proto.js to render the data
  updater.emit('updateData');
};

// Mongodb Interfacing

function getMongoID() {
  // Creates a unique ID for each run
  const uniqueID = String(
    String(new Date().getDate())
      + String(new Date().getHours())
      + String(new Date().getMinutes()),
  );
  console.log(uniqueID);
  return String(`run${uniqueID}`);
}

module.exports.archiveData = function archiveData(id) {
  let myID;
  if (!id) {
    // if we didn't specify an ID, make one
    myID = getMongoID();
  } else {
    myID = id;
  }
  MongoClient.connect(
    String(
      `mongodb://${dbIP}:${dbPort}`,
    ),
    { useNewUrlParser: true },
    (err, db) => {
      if (err) throw err;
      const dbo = db.db('BadgerloopRunData');
      dbo.createCollection(id, (error) => {
        if (error) throw error;
        console.log('Collection Created');
      });
      dbo.collection(myID).insertOne(storedData, (errors) => {
        if (errors) throw errors;
        db.close();
      });
    },
  );
};
