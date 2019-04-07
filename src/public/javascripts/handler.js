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
const archiveButton = d.getElementById('archiveButton');
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

// State Machine Control Panel Event Listeners
function resetAllButtons() {
  document.getElementById('postRun').className = 'stateButton3Inactive';
  document.getElementById('propulsionStart').className = 'stateButton5Inactive';
  document.getElementById('preRunFault').className = 'stateButton6Inactive';
  document.getElementById('idle').className = 'stateButton2Inactive';
  document.getElementById('ready').className = 'stateButton2Inactive';
  document.getElementById('serviceLowSpeed').className = 'stateButton3Inactive';
  document.getElementById('propulsionDistanceSense').className = 'stateButton5Inactive';
  document.getElementById('duringRunFault').className = 'stateButton6Inactive';
  document.getElementById('readyForPumpdown').className = 'stateButton4Inactive';
  document.getElementById('pumpdown').className = 'stateButton4Inactive';
  document.getElementById('safeToApproach').className = 'stateButton3Inactive';
  document.getElementById('brakingStart').className = 'stateButton5Inactive';
  document.getElementById('postRunFault').className = 'stateButton6Inactive';
}
// Handles power off button click
d.getElementById('powerOff').addEventListener('click', () => {
  console.log('powering off');
});

// Handles the archive button click
archiveButton.addEventListener('click', () => {
  di.archiveData();
  console.log('archiving data');
  resetAllButtons();
  document.getElementById('archiveButton').className = 'stateButtonActive';
});

// Handles postRun (magenta) button click
d.getElementById('postRun').addEventListener('click', () => {
  console.log('postRun');
  resetAllButtons();
  document.getElementById('postRun').className = 'stateButton3Active';
});

// Handles propulsionStart button click
d.getElementById('propulsionStart').addEventListener('click', () => {
  console.log('propulsion start');
  resetAllButtons();
  document.getElementById('propulsionStart').className = 'stateButton5Active';
});

// Handles preRunFault button click
d.getElementById('preRunFault').addEventListener('click', () => {
  console.log('preRunFault');
  resetAllButtons();
  document.getElementById('preRunFault').className = 'stateButton6Active';
});

// Handles primBrakeOn button click
d.getElementById('primBrakeOn').addEventListener('click', () => {
  console.log('primary brake on');
});

// Handles primBreakOff button click
d.getElementById('primBrakeOff').addEventListener('click', () => {
  console.log('primary brake off');
});

// Handles idle button click
d.getElementById('idle').addEventListener('click', () => {
  console.log('idling');
  resetAllButtons();
  document.getElementById('idle').className = 'stateButton2Active';
});

// Handles ready button click
d.getElementById('ready').addEventListener('click', () => {
  console.log('ready');
  resetAllButtons();
  document.getElementById('ready').className = 'stateButton2Active';
});

// Handles serviceLowSpeed button click
d.getElementById('serviceLowSpeed').addEventListener('click', () => {
  console.log('serviceLowSpeed');
  resetAllButtons();
  document.getElementById('serviceLowSpeed').className = 'stateButton3Active';
});

// Handles propulsionDistanceSense button click
d.getElementById('propulsionDistanceSense').addEventListener('click', () => {
  console.log('propulsionDistanceSense');
  resetAllButtons();
  document.getElementById('propulsionDistanceSense').className = 'stateButton5Active';
});

// Handles duringRunFault button click
d.getElementById('duringRunFault').addEventListener('click', () => {
  console.log('duringRunFault');
  resetAllButtons();
  document.getElementById('duringRunFault').className = 'stateButton6Active';
});

// Handles hvEnable button click
d.getElementById('hvEnable').addEventListener('click', () => {
  console.log('hvEnable');
});

// Handles hvDisable button click
d.getElementById('hvDisable').addEventListener('click', () => {
  console.log('hvDisable');
});

// Handles readyForPumpdown button click
d.getElementById('readyForPumpdown').addEventListener('click', () => {
  console.log('ready for pumpdown');
  resetAllButtons();
  document.getElementById('readyForPumpdown').className = 'stateButton4Active';
});

// Handles pumpdown button click
d.getElementById('pumpdown').addEventListener('click', () => {
  console.log('pumpdown');
  resetAllButtons();
  document.getElementById('pumpdown').className = 'stateButton4Active';
});

// Handles safeToApproach button click
d.getElementById('safeToApproach').addEventListener('click', () => {
  console.log('safe to approach');
  resetAllButtons();
  document.getElementById('safeToApproach').className = 'stateButton3Active';
});

// Handles brakingStart button click
d.getElementById('brakingStart').addEventListener('click', () => {
  console.log('braking start');
  resetAllButtons();
  document.getElementById('brakingStart').className = 'stateButton5Active';
});

// Handles postRunFault button click
d.getElementById('postRunFault').addEventListener('click', () => {
  console.log('postRunFault');
  resetAllButtons();
  document.getElementById('postRunFault').className = 'stateButton6Active';
});

// Handles secBrakeVentOn button click
d.getElementById('secBrakeVentOn').addEventListener('click', () => {
  console.log('secBrakeVentOn');
});

// Handles secBrakeVentOff button click
d.getElementById('secBrakeVentOff').addEventListener('click', () => {
  console.log('secBrakeVentOff');
});

function setRecieve(state) {
  if (state) recieveIndicator1.className = 'statusGood';
  if (state) recieveIndicator2.className = 'statusGood';
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
