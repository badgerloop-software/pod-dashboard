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
const cache = require('./cache');

const d = document;
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
const confirmationModal = document.querySelector('.confirmationModal');
// const confirmationTrigger = document.querySelector('.confirmationTrigger');
const closeButton2 = document.querySelector('.close-button2');
// const motorSafteyToggle = d.getElementById('motor-safety-status');
// const motorSafteyButton = d.getElementById('motor-safety');
const estopButton = d.getElementById('estop');
let confirmModalBtn = d.getElementById('confirmStart');
const renderer = new Renderer();
const TIMEOUT = 5000;

let boneStatus = [false, false]; // [LV, HV]

// Sets the latency counter
function setAgeLabel(staleness) {
  if (staleness > 0) d.getElementById('ageDisplay').innerHTML = String(`${staleness}ms`);
}

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
  if (smButtons[i] === d.getElementById('archiveButton')) {
    makeArchiveListener(smButtons[i]);
  } if (smButtons[i] === d.getElementById('crawlPrecharge') || smButtons[i] === d.getElementById('crawl') || smButtons[i] === d.getElementById('propulsion') || smButtons[i] === d.getElementById('hvEnable') || smButtons[i] === d.getElementById('hvDisable') || smButtons[i] === d.getElementById('primBrakeOn') || smButtons[i] === d.getElementById('primBrakeOff') || smButtons[i] === d.getElementById('secBrakeVentOn') || smButtons[i] === d.getElementById('secBrakeVentOff')) {
    continue; // eslint-disable-line
  } else { // all other buttons
    makeListener(smButtons[i]);
  }
}

function enableHV() {
  document.getElementById('hvText').classList.add('active');
  console.log('HV on');
  client.enableHV();
}

function sendPrecharge() {
  overrideState('crawlPrecharge');
}

d.getElementById('crawlPrecharge').addEventListener('click', () => {
  toggleConfirmationModal('service precharge?', sendPrecharge);
});

document.getElementById('hvEnable').addEventListener('click', () => {
  toggleConfirmationModal('high voltage systems?', enableHV);
});

document.getElementById('hvDisable').addEventListener('click', () => {
  document.getElementById('hvText').classList.remove('active');
  client.disableHV();
});

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
    secBrakeOffText.style.color = 'black';
    if (call) client.secBrakeOn();
  }
  if (!state) {
    secBrakeOffText.style.color = 'lime';
    secBrakeOnText.style.color = 'black';
    if (call) client.secBrakeOff();
  }
}

primBrakeOff.addEventListener('click', () => { togglePrimBrake(false, true); });
primBrakeOn.addEventListener('click', () => { togglePrimBrake(true, true); });
secBrakeOn.addEventListener('click', () => { toggleSecBrake(true, true); });
secBrakeOff.addEventListener('click', () => { toggleSecBrake(false, true); });

function checkBraking(basePacket) {
  let fixedPacket = basePacket;
  if (basePacket.braking.primBrake === 1) togglePrimBrake(true);
  else togglePrimBrake(false);
  if (basePacket.braking.secBrake === 1) toggleSecBrake(true);
  else toggleSecBrake(false);
  delete fixedPacket.braking.primBrake;
  delete fixedPacket.braking.secBrake;
  return fixedPacket;
}

estopButton.addEventListener('click', () => {
  client.sendEBrake();
});

function sendGo() {
  console.log('go');
  overrideState('propulsion');
}

function sendCrawl() {
  console.log('crawl');
  overrideState('crawl');
}

document.getElementById('propulsion').addEventListener('click', () => {
  toggleConfirmationModal('propulsion systems?', sendGo);
});

document.getElementById('crawl').addEventListener('click', () => {
  toggleConfirmationModal('service propulsion?', sendCrawl);
});

confirmModalBtn.addEventListener('click', toggleConfirmationModal);
closeButton2.addEventListener('click', toggleConfirmationModal);

// Connection Indicators
function setRecieve(state) {
  if (state) {
    recieveIndicator1.className = 'statusGood';
    recieveIndicator2.className = 'statusGood';
    d.getElementById('ageDisplay').className = 'statusGood';
  }
  if (!state) {
    recieveIndicator1.className = 'statusBad';
    recieveIndicator2.className = 'statusBad';
    d.getElementById('ageDisplay').innerHTML = 'N/A';
    d.getElementById('ageDisplay').className = 'statusBad';
  }
}

function setLVIndicator(state) {
  if (state) lvIndicator.className = 'statusGood';
  if (!state) lvIndicator.className = 'statusBad';
}

function setHVIndicator(state) {
  if (state) hvIndicator.className = 'statusGood';
  if (!state) hvIndicator.className = 'statusBad';
}

function checkRecieve() {
  let now = new Date().getTime();
  let difference = now - renderer.lastRecievedTime;
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

function checkTransmit() {
  setLVIndicator(boneStatus[0]);
  setHVIndicator(boneStatus[1]);
}

function podConnectionCheck() {
  checkRecieve();
  sendHeartbeats();
  checkTransmit();
}

setInterval(podConnectionCheck, 1000);

function init() {
  di.createCache();
  dl.fillAllItems();
  dl.fillAllTables();
  // toggleMotorSafety(true);
}
// Run at init
init();

// Data in recieved
comms.on('dataIn', (input, time) => {
  let fixedPacket = checkBraking(input);
  di.normalizePacket(fixedPacket);
  setAgeLabel(time);
  renderer.lastRecievedTime = new Date().getTime();
});
