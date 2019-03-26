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
const dr = require('./public/javascripts/dropdown');

const d = document;
const archiveButton = d.getElementById('archiveButton');
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

// Handles power off button click
d.getElementById('powerOff').addEventListener('click', () => {
  console.log('powering off');
});

// Handles the archive button click
archiveButton.addEventListener('click', () => {
  di.archiveData();
  console.log('archiving data');
});

// Handles postRun (magenta) button click
d.getElementById('postRun').addEventListener('click', () => {
  console.log('postRun');
});

// Handles propulsionStart button click
d.getElementById('propulsionStart').addEventListener('click', () => {
  console.log('propulsion start');
});

// Handles preRunFault button click
d.getElementById('preRunFault').addEventListener('click', () => {
  console.log('preRunFault');
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
});

// Handles ready button click
d.getElementById('ready').addEventListener('click', () => {
  console.log('ready');
});

// Handles serviceLowSpeed button click
d.getElementById('serviceLowSpeed').addEventListener('click', () => {
  console.log('serviceLowSpeed');
});

// Handles propulsionDistanceSense button click
d.getElementById('propulsionDistanceSense').addEventListener('click', () => {
  console.log('propulsionDistanceSense');
});

// Handles duringRunFault button click
d.getElementById('duringRunFault').addEventListener('click', () => {
  console.log('duringRunFault');
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
});

// Handles pumpdown button click
d.getElementById('pumpdown').addEventListener('click', () => {
  console.log('pumpdown');
});

// Handles safeToApproach button click
d.getElementById('safeToApproach').addEventListener('click', () => {
  console.log('safe to approach');
});

// Handles brakingStart button click
d.getElementById('brakingStart').addEventListener('click', () => {
  console.log('braking start');
});

// Handles postRunFault button click
d.getElementById('postRunFault').addEventListener('click', () => {
  console.log('postRunFault');
});

// Handles secBrakeVentOn button click
d.getElementById('secBrakeVentOn').addEventListener('click', () => {
  console.log('secBrakeVentOn');
});

// Handles secBrakeVentOff button click
d.getElementById('secBrakeVentOff').addEventListener('click', () => {
  console.log('secBrakeVentOff');
});

function init() {
  di.createCache();
  dr.fillAllItems();
  dl.fillAllTables();
}
// Run at init
init();
