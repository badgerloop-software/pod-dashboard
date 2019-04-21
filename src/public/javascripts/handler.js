/*
Author: Eric Udlis, Michael Handler
Purpose: Handle all updaters and interfacing between the frontend and backend
*/
const client = require('./public/javascripts/communication');
const di = require('./public/javascripts/datainterfacing');
const comms = require('./public/javascripts/communication').recievedEmitter;
const constants = require('./constants');
const cache = require('./cache');
const dl = require('./public/javascripts/dynamicloading');

const d = document;
const smControlPanel = d.getElementById('header3');
const smButtons = smControlPanel.getElementsByTagName('button');
const lvIndicator = d.getElementById('connectionDot1');
const hvIndicator = d.getElementById('connectionDot2');
const recieveIndicator1 = d.getElementById('link1');
const recieveIndicator2 = d.getElementById('link2');
let timeNew;
let timeOld;
let boneStatus = [false, false]; // [LV, HV]
// let renderer;

// Data in recieved
comms.on('dataIn', (input, time) => {
  di.normalizePacket(input);
  timeNew = time;
});

// Update the Database and Render the latest entry
function renderData(group, sensor) {
  // Get numbers
  const t = d.getElementById(String(sensor));
  const stored = cache[group][sensor];
  // Set number
  if (stored[stored.length - 1] == null) {
    console.log(`${group} ${sensor} ${stored[stored.length - 1]}`);
  }
  t.innerHTML = String(stored[stored.length - 1]);
}
// Sets the latency counter
function setAgeLabel(staleness) {
  d.getElementById('ageDisplay').innerHTML = String(`${staleness}ms`);
}

di.packetHandler.on('renderData', () => {
  console.log('starting render');
  const counter = new Date();
  let elapsedTime;
  const renderable = di.findRenderable();


  // if (!timeOld) { elapsedTime = timeNew; } else {
  //   console.log(timeNew);
  //   elapsedTime = timeNew - timeOld;
  //   console.log(elapsedTime);
  //   setAgeLabel(elapsedTime);
  //   timeOld = timeNew;
  // }
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
  const groups = Object.keys(renderable);
  groups.forEach((group) => {
    const sensors = Object.keys(renderable[group]);
    sensors.forEach((sensor) => {
      // Check to see if that particular sensor is being rendered at the time
      try {
        renderData(group, sensor);
      } catch (error) {
        // If not, alert the user and move on
        console.error(`Error: Sensor ${sensor} in ${group} not rendered`);
      }
    });
  });
  console.log('done rendering');
});

function overrideState(state) {
  console.error(`OVERIDING STATE TO ${state} STATE`);
  client.sendOverride(state);
  dl.switchState(state);
}

// State Machine Control Panel Event Listeners

function makeListener(btn) {
  btn.addEventListener('click', (e) => {
    let clicked = String(e.target.tagName);
    let temp = String(e.target.id);
    if (clicked === 'P') temp = e.target.parentElement.id;
    overrideState(temp);
  });
}

function makeArchiveListener(btn) {
  btn.addEventListener('click', () => {
    di.archiveData();
    console.log('archiving data');
  });
}

// iterate through list of buttons and call makeListener
for (let i = 0; i < smButtons.length; i += 1) {
  // archive data is an exception
  if (smButtons[i] === d.getElementById('archiveButton')) {
    makeArchiveListener(smButtons[i]);
  } else { // all other buttons
    makeListener(smButtons[i]);
  }
}

function setRecieve(state) {
  if (state) recieveIndicator1.className = 'statusGood';
  if (state) recieveIndicator2.className = 'statusGood';
  if (state) d.getElementById('ageDisplay').className = 'statusGood';
  if (!state) recieveIndicator1.className = 'statusBad';
  if (!state) recieveIndicator2.className = 'statusBad';
  if (!state) d.getElementById('ageDisplay').innerHTML = 'N/A';
  if (!state) d.getElementById('ageDisplay').className = 'statusGood';
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
  if (sensorArray[0]) return sensorArray[0];
  sensorArray = Object.values(subsystemArray[2]);
  return sensorArray[0];
}

function checkRecieve() {
  let sampleSensor = getSampleSensor();
  let good;
  try {
    if (!(sampleSensor.length > oldLength)) {
      setRecieve(false);
      good = false;
    } else {
      setRecieve(true);
      good = true;
    }
    oldLength = sampleSensor.length;
  } catch (err) {
    oldLength = 0;
  }
  return good;
}

function sendHeartbeats() {
  client.sendLVPing();
  client.sendHVPing();
}

comms.on('Lost', (ip) => {
  if (ip === constants.lvBone.ip) {
    console.error('lost lv bone');
    boneStatus[0] = false;
  }
  if (ip === constants.hvBone.ip) {
    console.error('lost hv bone');
    boneStatus[1] = false;
  }
});

comms.on('ok', (ip) => {
  if (ip === constants.lvBone.ip) { boneStatus[0] = true; }
  if (ip === constants.hvBone.ip) { boneStatus[1] = true; }
});

function checkTransmit() {
  setLVIndicator(boneStatus[0]);
  setHVIndicator(boneStatus[1]);
}

function podConnectionCheck() {
  checkRecieve();
  sendHeartbeats();
  checkTransmit();
  // let good = checkRecieve();
  // if (!good && renderer) {
  //   clearInterval(renderer);
  //   renderer = false;
  // } else if (good && !renderer) {
  //   renderer = setInterval(() => { di.packetHandler.emit('renderData'); }, 200);
  // }
}

// setInterval(() => { di.packetHandler.emit('renderData'); }, 150);
setInterval(podConnectionCheck, 1000);

function init() {
  di.createCache();
  dl.fillAllItems();
  dl.fillAllTables();
}
// Run at init
init();
