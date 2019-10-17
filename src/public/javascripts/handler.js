/*
Author: Eric Udlis, Michael Handler
Purpose: Handle all updaters and interfacing between the frontend and backend
*/
const client = require('./public/javascripts/communication');
const di = require('./public/javascripts/datainterfacing');
const comms = require('./public/javascripts/communication').recievedEmitter;
const constants = require('./constants');
const dl = require('./public/javascripts/dynamicloading');
const Renderer = require('./public/javascripts/renderer');
const Timer = require('./public/javascripts/Timer');
const Countdown = require('./public/javascripts/Countdown');
const cache = require('./cache');
const dataRecording = require('./dataRecording');

const d = document;
const TIMEOUT = 5000;

const smControlPanel = d.getElementById('header3');
const smButtons = smControlPanel.getElementsByTagName('button');
const lvIndicator = d.getElementById('connectionDot1');
const hvIndicator = d.getElementById('connectionDot2');
const recieveIndicator1 = d.getElementById('link1');
const recieveIndicator2 = d.getElementById('link2');
const primBrakeOn = d.getElementById('primBrakeOn');
const primBrakeOff = d.getElementById('primBrakeOff');
const secBrakeOn = d.getElementById('secBrakeVentOn');
const secBrakeOff = d.getElementById('secBrakeVentOff');
const primBrakeOnText = d.getElementById('primEnText');
const primBrakeOffText = d.getElementById('primDisText');
const secBrakeOnText = d.getElementById('secEnText');
const secBrakeOffText = d.getElementById('secDisText');
const confirmationModal = d.querySelector('.confirmationModal');
const closeButton2 = d.querySelector('.close-button2');
const estopButton = d.getElementById('estop');
const dataRecordButton = d.getElementById('dataRecordButton');
const archiveButton = d.getElementById('archiveButton');
const renderer = new Renderer();
const globalTimer = new Timer();
const { stateTimer } = dl;

let confirmModalBtn = d.getElementById('confirmStart');
let activeTimer = globalTimer;
let { DEBUG } = Boolean(process.env) || false;
let boneStatus = [false, false]; // [LV, HV]
let packetCounts = [0, 0]; // [LV, HV]
// eslint-disable-next-line no-unused-vars
let oldCounts = [0, 0];

// Update the Database and Render the latest entry
function renderData(group, sensor) {
  // Get numbers
  const t = d.getElementById(String(sensor));
  const stored = cache[group][sensor];
  // Set number
  if (stored[stored.length - 1] == null) {
    t.innerHTML = 'Not Available';
  } else {
    t.innerHTML = String(stored[stored.length - 1]);
  }
}

function overrideState(state) {
  if (DEBUG) console.error(`OVERIDING STATE TO ${state} STATE`);
  client.sendOverride(state);
  dl.switchState(state);
  stateTimer.reset();
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

function autosave() {
  di.archiveData('autosave');
}

function toggleConfirmationModal(msg, cb) {
  confirmationModal.classList.toggle('show-modal');
  if (msg && cb) {
    let el = confirmModalBtn;
    let elClone = el.cloneNode(true);
    confirmModalBtn = elClone;
    el.parentNode.replaceChild(elClone, el);
    confirmModalBtn.addEventListener('click', toggleConfirmationModal);
    document.getElementById('confirmMsg').innerHTML = `Are you sure you want to engage ${msg}`;
    confirmModalBtn.addEventListener('click', cb);
  }
}

// iterate through list of buttons and call makeListener
for (let i = 0; i < smButtons.length; i += 1) {
  // handle exceptions
  if (smButtons[i].classList.contains('stateButton') && smButtons[i].id !== 'powerOff') {
    // If it is a colored button
    continue; // eslint-disable-line
  }
  if (smButtons[i] === d.getElementById('pumpdown') || smButtons[i] === d.getElementById('crawlPrecharge') || smButtons[i] === d.getElementById('crawl') || smButtons[i] === d.getElementById('propulsion')) {
    continue; // eslint-disable-line
  }
  if (smButtons[i] === d.getElementById('archiveButton')) {
    makeArchiveListener(smButtons[i]);
    continue; // eslint-disable-line
  }
  makeListener(smButtons[i]);
}

function togglePrimBrake(state, call) {
  if (state) {
    primBrakeOnText.style.color = 'lime';
    primBrakeOffText.style.color = 'white';
    if (call) client.primBrakeOn();
  }
  if (!state) {
    primBrakeOffText.style.color = 'lime';
    primBrakeOnText.style.color = 'white';
    if (call) client.primBrakeOff();
  }
}

function toggleSecBrake(state, call) {
  if (state) {
    secBrakeOnText.style.color = 'lime';
    secBrakeOffText.style.color = 'white';
    if (call) client.secBrakeOn();
  }
  if (!state) {
    secBrakeOffText.style.color = 'lime';
    secBrakeOnText.style.color = 'white';
    if (call) client.secBrakeOff();
  }
}

function checkBraking(basePacket) {
  let fixedPacket = basePacket;
  if (basePacket.braking !== undefined) {
    if (basePacket.braking.primBrake === 1) togglePrimBrake(false, false);
    else togglePrimBrake(true, false);
    if (basePacket.braking.secBrake === 1) toggleSecBrake(false, false);
    else toggleSecBrake(true, false);
    delete fixedPacket.braking.primBrake;
    delete fixedPacket.braking.secBrake;
  }
  return fixedPacket;
}
// Connection Indicators
function setRecieve(state) {
  if (state) {
    recieveIndicator1.className = 'statusGood';
    recieveIndicator2.className = 'statusGood';
    d.getElementById('ageDisplay').className = 'statusGood';
    if (!globalTimer.process) {
      globalTimer.start();
    }
  }
  if (!state) {
    recieveIndicator1.className = 'statusBad';
    recieveIndicator2.className = 'statusBad';
    d.getElementById('ageDisplay').innerHTML = 'N/A';
    d.getElementById('ageDisplay').className = 'statusBad';
    globalTimer.reset();
  }
}

function displayTimer(timer) {
  if (`${timer.getSeconds()}`.length === 1) d.getElementById('ageDisplay').innerHTML = `${timer.getMinutes()}:0${timer.getSeconds()}`;
  else d.getElementById('ageDisplay').innerHTML = `${timer.getMinutes()}:${timer.getSeconds()}`;
}

function setLVIndicator(state) {
  if (state) lvIndicator.className = 'statusGood';
  if (!state) lvIndicator.className = 'statusBad';
}

function setHVIndicator(state) {
  if (state) hvIndicator.className = 'statusGood';
  if (!state) hvIndicator.className = 'statusBad';
  if (!state && !DEBUG) overrideState('powerOff');
}

function checkRecieve() {
  let now = new Date().getTime();
  let difference = now - renderer.lastRecievedTime;
  displayTimer(activeTimer);
  // console.log(`now: ${now} difference ${difference} timeout ${TIMEOUT}`);
  if ((difference > TIMEOUT) || renderer.lastRecievedTime === 0) {
    setRecieve(false);
    renderer.stopRenderer();
  } else {
    setRecieve(true);
    renderer.startRenderer();
  }
}

function sendHeartbeats() {
  client.sendLVPing();
  client.sendHVPing();
}


function checkTransmit() {
  setLVIndicator(boneStatus[0]);
  setHVIndicator(boneStatus[1]);
}


function updateLabels() {
  if (oldCounts[0] < packetCounts[0] + 5) {
    // Still Recieving packets
    d.getElementById('motionDisconnected').style.display = 'none';
    d.getElementById('brakingDisconnected').style.display = 'none';
  } else {
    // Haven't recieved packets
    d.getElementById('motionDisconnected').style.display = 'inline';
    d.getElementById('brakingDisconnected').style.display = 'inline';
  }
  if (oldCounts[1] < packetCounts[1] + 5) {
    // Still recieving packets
    d.getElementById('motorDisconnected').style.display = 'none';
    d.getElementById('batteryDisconnected').style.display = 'none';
  } else {
    // Haven't recieved packets
    d.getElementById('motorDisconnected').style.display = 'inline';
    d.getElementById('batteryDisconnected').style.display = 'inline';
  }
  oldCounts[0] = packetCounts[0];
  oldCounts[1] = packetCounts[1];
  /** ***************************
  // return null;
   ***************************** */
}

function podConnectionCheck() {
  checkRecieve();
  sendHeartbeats();
  checkTransmit();
  updateLabels();
}

function checkPackets(input) {
  if (input.braking && input.motion) packetCounts[0]++;
  if (input.motor && input.battery) packetCounts[1]++;
}


// Event Listeners

document.getElementById('ageDisplay').addEventListener('click', () => {
  if (activeTimer === globalTimer) {
    document.getElementById('ageLabel').innerHTML = 'State Timer';
    activeTimer = stateTimer;
    return;
  }
  if (activeTimer === stateTimer || propTimer) {
    document.getElementById('ageLabel').innerHTML = 'Global Timer';
    activeTimer = globalTimer;
  }
});

estopButton.addEventListener('click', () => {
  client.sendEBrake();
});

document.getElementById('propulsion').addEventListener('click', () => {
  toggleConfirmationModal('propulsion systems?', () => {
    console.log('go');
    propCountdown = new Countdown(30);
    propCountdown.start();
    // activeTimer = propCountdown;
    overrideState('propulsion');
  });
});

document.getElementById('crawl').addEventListener('click', () => {
  toggleConfirmationModal('service propulsion?', () => {
    overrideState('crawl');
  });
});

confirmModalBtn.addEventListener('click', toggleConfirmationModal);
closeButton2.addEventListener('click', toggleConfirmationModal);
primBrakeOff.addEventListener('click', () => { togglePrimBrake(false, true); });
primBrakeOn.addEventListener('click', () => { togglePrimBrake(true, true); });
secBrakeOn.addEventListener('click', () => { toggleSecBrake(true, true); });
secBrakeOff.addEventListener('click', () => { toggleSecBrake(false, true); });
d.getElementById('crawlPrecharge').addEventListener('click', () => {
  toggleConfirmationModal('service precharge?', () => {
    overrideState('crawlPrecharge');
  });
});

document.getElementById('cmdTorque').addEventListener('click', () => {
  client.commandTorque();
});

document.getElementById('hvEnable').addEventListener('click', () => {
  toggleConfirmationModal('high voltage systems?', () => {
    document.getElementById('hvText').classList.add('active');
    if (document.getElementById('hvDisText').classList.contains('active')) {
      document.getElementById('hvDisText').classList.remove('active');
    }
    client.enableHV();
  });
});

d.getElementById('pumpdown').addEventListener('click', () => {
  toggleConfirmationModal('precharge?', () => {
    overrideState('pumpdown');
  });
});

d.getElementById('precharge').addEventListener('click', () => {
  toggleConfirmationModal('the precharge action, not the state!', () => {
    client.enPrecharge();
  });
});

d.getElementById('latchOn').addEventListener('click', () => {
  d.getElementById('latchOnText').style.color = 'red';
  d.getElementById('latchOffText').style.color = 'white';
  toggleConfirmationModal('turn on the MCU Latch?', () => {
    client.toggleLatch(true);
  });
});
function disableHV() {
  client.disableHV();
  if (document.getElementById('hvText').classList.contains('active')) {
    document.getElementById('hvText').classList.remove('active');
  }
  document.getElementById('hvDisText').classList.add('active');
}
document.getElementById('hvDisable').addEventListener('click', disableHV);

d.getElementById('latchOff').addEventListener('click', () => {
  d.getElementById('latchOnText').style.color = 'white';
  d.getElementById('latchOffText').style.color = 'red';
  client.toggleLatch(false);
});

// Starts the recording of data to dataRecording.js
dataRecordButton.addEventListener('click', () => {
  if(!di.isDataRecording){
    di.recordingEvent.emit(true); // Tell DI to run start recording data
    console.log('recording data');
  } else {
    console.log('data is already being recorded');
  }
})

// Archives the data from dataRecording.js if data is being recorded
archiveButton.addEventListener('click', () => {
  if(di.isDataRecording){
    di.recordingEvent.emit(false); // Tells DI to stop recording data
    di.archiveData();
    console.log('archiving data');
    di.createCache(dataRecording);
  } else {
    console.log('data was not being recorded');
  }
});

// Intervals

setInterval(podConnectionCheck, 1000);
setInterval(autosave, 30000);

// Init

function init() {
  di.createCache(cache);
  di.createCache(dataRecording);
  dl.fillAllItems();
  dl.fillAllTables();
  displayTimer(globalTimer);
  console.log(DEBUG);
  // toggleMotorSafety(true);
}
// Run at init
init();

// Events

// Data in recieved
comms.on('dataIn', (input) => {
  if (DEBUG) console.log(input);
  checkPackets(input);
  let fixedPacket = checkBraking(input);
  di.normalizePacket(fixedPacket);
  renderer.lastRecievedTime = new Date().getTime();
});

comms.on('Lost', (ip) => {
  if (ip === constants.lvBone.ip) {
    if (boneStatus[0]) console.error('lost LV bone');
    boneStatus[0] = false;
  }
  if (ip === constants.hvBone.ip) {
    if (boneStatus[1]) console.error('lost LV bone');
    boneStatus[1] = false;
  }
});

comms.on('ok', (ip) => {
  if (ip === constants.lvBone.ip) { boneStatus[0] = true; }
  if (ip === constants.hvBone.ip) { boneStatus[1] = true; }
});

di.packetHandler.on('renderData', () => {
  const renderable = di.findRenderable();

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
});
