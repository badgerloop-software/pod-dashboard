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

// State Machine Control Panel Even Listeners

// Handles power off button click
powerOff.addEventListener('click', () => {
  console.log('powering off');
});

// Handles the archive button click
archiveButton.addEventListener('click', () => {
  di.archiveData();
  console.log('archiving data');
});

// Handles postRun1 (magenta) button click
postRun1.addEventListener('click', () => {
  console.log('postRun1');
});

// Handles hyperloop1 (left most) button click
hyperloop1.addEventListener('click', () => {
  console.log('hyperloop1');
});

// Handles hyperloop2 (center) button click
hyperloop2.addEventListener('click', () => {
  console.log('hyperloop2');
});

// Handles hyperloop3 (right most) button click
hyperloop3.addEventListener('click', () => {
  console.log('hyperloop3');
});

// Handles preRun button click
preRun.addEventListener('click', () => {
  console.log('preRun');
});

// Handles primBrakeOn button click
primBrakeOn.addEventListener('click', () => {
  console.log('primary brake on');
});

// Handles primBreakOff button click
primBrakeOff.addEventListener('click', () => {
  console.log('primary brake off');
});

// Handles idle button click
idle.addEventListener('click', () => {
  console.log('idling');
});

// Handles ready button click
ready.addEventListener('click', () => {
  console.log('ready');
});

// Handles serviceLowSpeed button click
serviceLowSpeed.addEventListener('click', () => {
  console.log('serviceLowSpeed');
});

// Handles openAir1 (left most) button click
openAir1.addEventListener('click', () => {
  console.log('openAir1');
});

// Handles openAir2 (center) button click
openAir2.addEventListener('click', () => {
  console.log('openAir2');
});

// Handles openAir3 (right most) button click
openAir3.addEventListener('click', () => {
  console.log('openAir3');
});

// Handles duringRun button click
duringRun.addEventListener('click', () => {
  console.log('duringRun');
});

// Handles hvEnable button click
hvEnable.addEventListener('click', () => {
  console.log('hvEnable');
});

// Handles hvDisable button click
hvDisable.addEventListener('click', () => {
  console.log('hvDisable');
});

// Handles readyForPumpdown button click
readyForPumpdown.addEventListener('click', () => {
  console.log('ready for pumpdown');
});

// Handles pumpdown button click
pumpdown.addEventListener('click', () => {
  console.log('pumpdown');
});

// Handles safeToApproach button click
safeToApproach.addEventListener('click', () => {
  console.log('safe to approach');
});

// Handles externalSubtrack1 (left most) button click
externalSubtrack1.addEventListener('click', () => {
  console.log('externalSubtrack1');
});

// Handles externalSubtrack2 (center) button click
externalSubtrack2.addEventListener('click', () => {
  console.log('externalSubtrack2');
});

// Handles externalSubtrack3 (right most) button click
externalSubtrack3.addEventListener('click', () => {
  console.log('externalSubtrack3');
});

// Handles postRun2 (Red) button click
postRun2.addEventListener('click', () => {
  console.log('postRun2');
});

// Handles secBrakeVentOn button click
secBrakeVentOn.addEventListener('click', () => {
  console.log('secondaryBrakeVentOn');
});

// Handles secBrakeVentOff button click
secBrakeVentOff.addEventListener('click', () => {
  console.log('secBrakeVentOff');
});
