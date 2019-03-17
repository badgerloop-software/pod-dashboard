/*
Author: Eric Udlis
Purpose: Handle all updaters and interfacing between the frontend and backend
*/
const client = require('./public/javascripts/communication');
const di = require('./public/javascripts/DataInterfacing');
const comms = require('./public/javascripts/communication').recievedEmitter;
const constants = require('./constants');
const storedData = require('./database.json');
const cache = require('./cache');
const dl = require('./public/javascripts/dynamicLoading');

const d = document;
const archiveButton = d.getElementById('archiveButton');
const settingsSubmit = d.getElementById('podSettingsSubmit');
let timeOld;

// Data in recieved
comms.on('dataIn', () => {
  console.log('dataIn - Event Recieved');
  // Log it to be sure
  console.log(client.inData);
  // Tell the Data Interfacer to start sorting it
  di.updateData(client.inData);
});

// Update the Database and Render the latest entry
function updateData(group, sensor) {
  // Get numbers
  const t = d.getElementById(String(sensor));
  const stored = cache[group][sensor];
  // Set number
  if (stored[stored.length - 1] == null) {
    console.log(`${group} ${sensor} ${stored[stored.length - 1]}`);
  }
  t.innerHTML = String(stored[stored.length - 1]);
}

// Render command
// Sets the latency counter
function setAgeLabel(staleness) {
  d.getElementById('ageDisplay').innerHTML = String(`${staleness}ms`);
}

di.updater.on('updateData', () => {
  const counter = new Date();
  let elapsedTime;
  const timeNew = counter.getMilliseconds();
  const groups = Object.keys(storedData);
  groups.forEach((group) => {
    const sensors = Object.keys(storedData[group]);
    sensors.forEach((sensor) => {
      // Check to see if that particular sensor is being rendered at the time
      try {
        if (group !== 'connections') updateData(group, sensor);
      } catch (error) {
        // If not, alert the user and move on
        console.log(`Unreconized Sensor- ${sensor} -Skipping`);
      }
    });
  });

  // Lag Counter, when testing should be equal to DATA_SEND_RATE
  if (!timeOld) {
    elapsedTime = counter.getMilliseconds() - timeNew - constants.dataSendRate;
  } else {
    elapsedTime = timeNew - timeOld - constants.dataSendRate;
  }
  timeOld = timeNew;
  if (elapsedTime > 0) {
    setAgeLabel(elapsedTime);
  }
});

// Handles the archive button click
archiveButton.addEventListener('click', () => {
  di.archiveData();
  console.log('archiving data');
});


// Settings Form

// Submits Entries to File
settingsSubmit.addEventListener('click', () => {
  constants.serverAddr.ip = d.getElementById('podIP').value;
  constants.serverAddr.port = Number(d.getElementById('podPort').value);
  constants.databaseAddr.ip = d.getElementById('databaseIP').value;
  constants.databaseAddr.port = Number(d.getElementById('databasePort').value);
  constants.scanningRate = Number(d.getElementById('scanningRate').value);
  d.getElementById('formFeedback').innerHTML = 'Settings Applied';
});

// Fills entries in text boxes
function fillConstants() { // eslint-disable-line no-unused-vars
  d.getElementById('formFeedback').innerHTML = '';
  d.getElementById('podIP').value = String(constants.serverAddr.ip);
  d.getElementById('podPort').value = constants.serverAddr.port;
  d.getElementById('databaseIP').value = constants.databaseAddr.ip;
  d.getElementById('databasePort').value = constants.databaseAddr.port;
  d.getElementById('scanningRate').value = constants.scanningRate;
}


function init() {
  di.createCache();
  dl.fillAllTables();
}
// Run at init
init();
