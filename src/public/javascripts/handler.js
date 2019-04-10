/*
Author: Eric Udlis, Michael Handler
Purpose: Handle all updaters and interfacing between the frontend and backend
*/
const client = require('./public/javascripts/communication');
const di = require('./public/javascripts/datainterfacing');
const comms = require('./public/javascripts/communication').recievedEmitter;
const constants = require('./constants');
const storedData = require('./database.json');
const cache = require('./cache');
const dl = require('./public/javascripts/dynamicloading');

const d = document;
const smControlPanel = d.getElementsByClassName('gridStateMachine');
const smButtons = d.getElementsByTagName('button');
const lvIndicator = d.getElementById('connectionDot1');
const hvIndicator = d.getElementById('connectionDot2');
const recieveIndicator1 = d.getElementById('link1');
const recieveIndicator2 = d.getElementById('link2');
let timeOld;

// Data in recieved
comms.on('dataIn', () => {
  // Log it to be sure
  console.log(client.inData);
  // Tell the Data Interfacer to start sorting it
  if (!(client.currentState >= 11 && client.currentState <= 13)) {
    dl.switchState(client.currentState);
  } else dl.setFault(client.currentState);
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
        updateData(group, sensor);
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

function overrideState(num, stn) {
  console.error(`OVERIDING STATE TO ${stn} STATE`);
  client.sendOverride(stn);
  dl.switchState(num, stn);
}

// State Machine Control Panel Event Listeners



// Handles the archive button click
//archiveButton.addEventListener('click', () => {
  //di.archiveData();
  //console.log('archiving data');
//});



function setRecieve(state) {
  if (state) recieveIndicator1.className = 'statusGood';
  if (state) recieveIndicator2.className = 'statusGood';
  if (state) d.getElementById('ageDisplay').className = 'statusGood';
  if (!state) recieveIndicator1.className = 'statusBad';
  if (!state) recieveIndicator2.className = 'statusBad';
  if (!state) d.getElementById('ageDisplay').innerHTML = 'N/A';
  if (!state) d.getElementById('ageDisplay').className = 'connectionError';
}

function setLVIndicator(state) {
  if (state) lvIndicator.className = 'statusGood';
  if (!state) lvIndicator.className = 'statusBad';
}

function setHVIndicator(state) {
  if (state) hvIndicator.className = 'statusGood';
  if (!state) hvIndicator.className = 'statusBad';
}

function getSampleSensor() {
  let subsystemArray = Object.values(cache);
  let sensorArray = Object.values(subsystemArray[0]);
  return sensorArray[0];
}

function checkRecieve() {
  let sampleSensor = getSampleSensor();
  try {
    if (!(sampleSensor.length > oldLength)) {
      setRecieve(false);
    } else {
      setRecieve(true);
    }
    oldLength = sampleSensor.length;
  } catch (err) {
    oldLength = 0;
  }
}

function sendHeartbeats() {
  client.sendLVPing();
  client.sendHVPing();
}
function lostLVBone(state) {
  try {
    if (state !== undefined) myState = state;
    return myState;
  } catch (err) {
    myState = false;
    return myState;
  }
}

function lostHVBone(state) {
  try {
    if (state !== undefined) myState = state;
    return myState;
  } catch (err) {
    myState = false;
    return myState;
  }
}
comms.on('Lost', (ip) => {
  if (ip === constants.lvBone.ip) {
    lostLVBone(true);
  }
  if (ip === constants.hvBone.ip) {
    lostHVBone(true);
  }
});
function checkTransmit() {
  setLVIndicator(true);
  setHVIndicator(true);
  if (lostLVBone()) setLVIndicator(false);
  if (lostHVBone()) setHVIndicator(false);
}

function podConnectionCheck() {
  checkRecieve();
  sendHeartbeats();
  checkTransmit();
}

setInterval(podConnectionCheck, 5000);

function init() {
  di.createCache();
  dl.fillAllItems();
  dl.fillAllTables();
}
// Run at init
init();
