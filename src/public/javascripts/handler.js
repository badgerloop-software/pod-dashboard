/*
Author: Eric Udlis, Michael Handler
Purpose: Handle all updaters and interfacing between the frontend and backend
*/
const client = require('./public/javascripts/communication');
const di = require('./public/javascripts/DataInterfacing');
const comms = require('./public/javascripts/communication').recievedEmitter;
const constants = require('./constants');
const storedData = require('./database');

const d = document;
const archiveButton = d.getElementById('archiveButton');
const settingsSubmit = d.getElementById('podSettingsSubmit');
let timeOld;

comms.on('heartbeat', () => {
  console.log('Heartbeat Recieved');
});

// Data in recieved
comms.on('dataIn', () => {
  console.log('dataIn - Event Recieved');
  // Log it to be sure
  console.log(client.inData);
  // Tell the Data Interfacer to start sorting it
  di.updateData(client.inData.data);
});

// Update the Database and Render the latest entry
function updateData(group, sensor) {
  // Get numbers
  const t = d.getElementById(String(sensor));
  const stored = storedData[group][sensor];
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

// Handles the archive button click
archiveButton.addEventListener('click', () => {
  di.archiveData();
  console.log('archiving data');
});

// Handles power off button click
one.addEventListener('click', () => {
  console.log('powering off');
});

// Handles Idle/Ready button click
two.addEventListener('click', () => {
  console.log('idling');
});

// Handles Post Run/service low speed/Safe to Approach button click
three.addEventListener('click', () => {
  console.log('safe to approach');
});

// Handles pumpdown/ready for pumpdown button click
four.addEventListener('click', () => {
  console.log('pumpdown');
});

// Handles hyperloop/openair/external subtrack button click
five.addEventListener('click', () => {
  console.log('hyperloop');
});

// Handles pre/during/post run buttons
six.addEventListener('click', () => {
  console.log('run status');
});

// Handles primary brake on/off button click
seven.addEventListener('click', () => {
  console.log('primary brake status');
});
