/**
 * @module Handler
 * @author Eric Udlis, Michael Handler
 * @description Handle all updates and interfacing between the front-end and back-end
 */
const CLIENT = require('./public/javascripts/communication');
const DATA_INTERFACING = require('./public/javascripts/datainterfacing');
const COMMUNICATIONS_EMITTER = require('./public/javascripts/communication').recievedEmitter;
const CONSTANTS = require('./constants');
const DYNAMIC_LOADING = require('./public/javascripts/dynamicloading');
const RENDERER = require('./public/javascripts/renderer');
const TIMER = require('./public/javascripts/Timer');
const CACHE = require('./cache');
const DATA_RECORDING = require('./dataRecording');

// New OOP stuff
const { State, STATES } = require('./public/javascripts/State');
const ControlPanelButton = require('./public/assets/ControlPanelButton');

ControlPanelButton.setParent(document.getElementById('controlpanelBox'));

const D = document;
const TIMEOUT = 5000;
const CONNECTION_CHECK_INTERVAL = 1000;
const AUTOSAVE_INTERVAL = 30000;
const STATE_BUTTONS = [['Power Off', '#C10000'], ['Idle', '#3C9159'],
  ['Pumpdown', '#C66553', true], ['Propulsion', '#C6A153', true], ['Braking', '#34495E'],
  ['Stopped', '#34495E'], ['Crawl Precharge', '#C6A153'], ['Crawl', '#A84671', true],
  ['Post Run', '#34495E'], ['Safe to Approach', '#3C9159'],
  ['Run Fault', 'red', false, true], ['Non-Run Fault', 'red', false, true]];
  // [Display Name, btn color, isHazardus, isFault]

const LV_INDICATOR = D.getElementById('connectionDot1');
const HV_INDICATOR = D.getElementById('connectionDot2');
const RECIEVE_INDICATOR_1 = D.getElementById('link1');
const RECIEVE_INDICATOR_2 = D.getElementById('link2');
const DATA_RECORD_BUTTON = new ControlPanelButton('dataRecord', 'Start Data Recording', '#AEA8D3', false);
const ARCHIVE_BUTTON = new ControlPanelButton('archiveData', 'Save Data Recording', '#AEA8D3', false);
ARCHIVE_BUTTON.greyOut();
const PRIMARY_BRAKE_ON = new ControlPanelButton('primBrakeOn', 'Prim. Brake Act', '#34495E', false);
const PRIMARY_BRAKE_OFF = new ControlPanelButton('primBrakeOff', 'Prim. Brake Retr', '#34495E', false);
const SECONDARY_BRAKE_ON = new ControlPanelButton('secBrakeOff', 'Sec. Brake Act', '#5C97BF', false);
const SECONDARY_BRAKE_OFF = new ControlPanelButton('secBrakeOn', 'Sec. Brake Retr', '#5C97BF', false);
const CONFIRMATION_MODAL = D.querySelector('.confirmationModal');
const EMERGENCY_STOP_BTN = D.getElementById('estop');
const TABLES_RENDERER = new RENDERER();
const GLOBAL_TIMER = new TIMER();
const { stateTimer: STATE_TIMER } = DYNAMIC_LOADING;

let confirmModalBtn = D.getElementById('confirmStart');
let activeTimer = GLOBAL_TIMER;
let { DEBUG } = Boolean(process.env) || false;
let boneStatus = [false, false]; // [LV, HV]
let packetCounts = [0, 0]; // [LV, HV]
// eslint-disable-next-line no-unused-vars
let oldCounts = [0, 0];


/**
 * @param  {String} group Group the sensor belongs to
 * @param  {String} sensor Sensor to modify
 */
// Renders latest entry in cace to the tables
function renderData(group, sensor) {
  // Get numbers
  const t = D.getElementById(String(sensor));
  const stored = CACHE[group][sensor];
  // Set number
  if (stored[stored.length - 1] == null) {
    t.innerHTML = 'Not Available';
  } else {
    t.innerHTML = String(stored[stored.length - 1]);
  }
}

/**
 * @param {State} state State to override to
 * Manually transitions the dashboard to state given
 */
function overrideState(state) {
  if (!state) throw new Error('Undefined State');
  if (DEBUG) console.error(`OVERIDING STATE TO ${state.displayName} STATE`);
  state.activate(CONFIRMATION_MODAL);
  STATE_TIMER.reset();
}

// State Machine Control Panel Event Listeners
/**
 * Creates a JSON save labled "Autosave"
 */
function autosave() {
  DATA_INTERFACING.archiveData('autosave');
}
/**
 * Prompts user with a confirmation window before running function
 * @param {String} msg Message to display in prompt
 * @param {Function} cb Function to run once confirmed
 */
function toggleConfirmationModal(msg, cb) {
  CONFIRMATION_MODAL.classList.toggle('show-modal');
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

/**
 * Toggles the primary braking indicators and calls the
 * communication call if noted by call
 * @param {Boolean} state // True for on, false for off
 * @param {Boolean} call
 */
function togglePrimBrake(state, call) {
  if (state) {
    PRIMARY_BRAKE_ON.activate();
    PRIMARY_BRAKE_OFF.deactivate();
    if (call) CLIENT.primBrakeOn();
  }
  if (!state) {
    PRIMARY_BRAKE_OFF.activate();
    PRIMARY_BRAKE_ON.deactivate();
    if (call) CLIENT.primBrakeOff();
  }
}
/**
 * Toggles the secondary braking indicators and calls the
 * communication call if noted by call
 * @param {Boolean} state // True for on, false for off
 * @param {Boolean} call
 */
function toggleSecBrake(state, call) {
  if (state) {
    SECONDARY_BRAKE_ON.activate();
    SECONDARY_BRAKE_OFF.deactivate();
    if (call) CLIENT.secBrakeOn();
  }
  if (!state) {
    SECONDARY_BRAKE_ON.deactivate();
    SECONDARY_BRAKE_OFF.activate();
    if (call) CLIENT.secBrakeOff();
  }
}
/**
 * Checks packet for primary and seconday braking status
 * changes indicators and deletes flags
 * @param {Object} basePacket The original packet
 * @returns {Object} fixedPacket The modified packet
 */
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
/**
 * Disables the HV on the pod, sends communication and changes lablel accordingly
 */
function disableHV() {
  CLIENT.disableHV();
  if (document.getElementById('hvText').classList.contains('active')) {
    document.getElementById('hvText').classList.remove('active');
  }
  document.getElementById('hvDisText').classList.add('active');
}

// Connection Indicators
/**
 * Sets recieve indicators and starts/stops timer based on status
 * @param {Boolean} state true for ok false for bad
 */
function setRecieve(state) {
  if (state) {
    RECIEVE_INDICATOR_1.className = 'statusGood';
    RECIEVE_INDICATOR_2.className = 'statusGood';
    D.getElementById('ageDisplay').className = 'statusGood';
    if (!GLOBAL_TIMER.process) {
      GLOBAL_TIMER.start();
    }
  }
  if (!state) {
    RECIEVE_INDICATOR_1.className = 'statusBad';
    RECIEVE_INDICATOR_2.className = 'statusBad';
    D.getElementById('ageDisplay').innerHTML = 'N/A';
    D.getElementById('ageDisplay').className = 'statusBad';
    GLOBAL_TIMER.reset();
  }
}
/**
 * Displays the given timer in defined display location
 * @param {Timer} timer Displays the timers current time
 */
function displayTimer(timer) {
  if (`${timer.getSeconds()}`.length === 1) D.getElementById('ageDisplay').innerHTML = `${timer.getMinutes()}:0${timer.getSeconds()}`;
  else D.getElementById('ageDisplay').innerHTML = `${timer.getMinutes()}:${timer.getSeconds()}`;
}
/**
 * Sets the LV indicator
 * @param {Boolean} state true for ok false for bad
 */
function setLVIndicator(state) {
  if (state) LV_INDICATOR.className = 'statusGood';
  if (!state) LV_INDICATOR.className = 'statusBad';
}
/**
 *Sets the HV indicator
 * @param {Boolean} state true for ok false for bad
 */
function setHVIndicator(state) {
  if (state) HV_INDICATOR.className = 'statusGood';
  if (!state) HV_INDICATOR.className = 'statusBad';
  if (!state && !DEBUG) overrideState(STATES[0]);
}
/**
 * Checks if dashboard has recieved packets within timeout period
 * If so, sets recieve indicator good and renders to tables
 * If bad,sets recieve indicator bad and stops rendering to tables
 */
function checkRecieve() {
  let now = new Date().getTime();
  let difference = now - TABLES_RENDERER.lastRecievedTime;
  displayTimer(activeTimer);
  // console.log(`now: ${now} difference ${difference} timeout ${TIMEOUT}`);
  if ((difference > TIMEOUT) || TABLES_RENDERER.lastRecievedTime === 0) {
    setRecieve(false);
    TABLES_RENDERER.stopRenderer();
  } else {
    setRecieve(true);
    TABLES_RENDERER.startRenderer();
  }
}
/**
 * Sends TCP heartbeats to Pod
 */
function sendHeartbeats() {
  CLIENT.sendLVPing();
  CLIENT.sendHVPing();
}

/**
 * Sets LV and HV indicators based on boneStatus
 */
function checkTransmit() {
  setLVIndicator(boneStatus[0]);
  setHVIndicator(boneStatus[1]);
}

/**
 * Updates lables of tables based on recieving packets or not
 */
function updateLabels() {
  if (oldCounts[0] < packetCounts[0] + 5) {
    // Still Recieving packets
    D.getElementById('motionDisconnected').style.display = 'none';
    D.getElementById('brakingDisconnected').style.display = 'none';
  } else {
    // Haven't recieved packets
    D.getElementById('motionDisconnected').style.display = 'inline';
    D.getElementById('brakingDisconnected').style.display = 'inline';
  }
  if (oldCounts[1] < packetCounts[1] + 5) {
    // Still recieving packets
    D.getElementById('motorDisconnected').style.display = 'none';
    D.getElementById('batteryDisconnected').style.display = 'none';
  } else {
    // Haven't recieved packets
    D.getElementById('motorDisconnected').style.display = 'inline';
    D.getElementById('batteryDisconnected').style.display = 'inline';
  }
  oldCounts[0] = packetCounts[0];
  oldCounts[1] = packetCounts[1];
  /** ***************************
  // return null;
   ***************************** */
}
/**
 * Checks if recieving packets, sends heartbeats to pod, checks if we get call back from pod
 * Updates Table Lables
 */
function podConnectionCheck() {
  checkRecieve();
  sendHeartbeats();
  checkTransmit();
  updateLabels();
}
/**
 * Checks weather given packet is a HV or LV packet and increments counter accordingly
 * @param {Object} input Packet to check
 */
function checkPackets(input) {
  if (input.braking && input.motion) packetCounts[0]++;
  if (input.motor && input.battery) packetCounts[1]++;
}


// Event Listeners
// Changes timer based on user input
document.getElementById('ageDisplay').addEventListener('click', () => {
  if (activeTimer === GLOBAL_TIMER) {
    document.getElementById('ageLabel').innerHTML = 'State Timer';
    activeTimer = STATE_TIMER;
    return;
  }
  if (activeTimer === STATE_TIMER || propTimer) {
    document.getElementById('ageLabel').innerHTML = 'Global Timer';
    activeTimer = GLOBAL_TIMER;
  }
});

// Sends Estop on user click
EMERGENCY_STOP_BTN.addEventListener('click', () => {
  CLIENT.sendEBrake();
});


// confirmModalBtn.addEventListener('click', toggleConfirmationModal);
// CLOSE_BUTTON_2.addEventListener('click', toggleConfirmationModal);

PRIMARY_BRAKE_ON.onClick(() => {
  togglePrimBrake(true, true);
});

PRIMARY_BRAKE_OFF.onClick(() => {
  togglePrimBrake(false, true);
});

SECONDARY_BRAKE_ON.onClick(() => {
  toggleSecBrake(true, true);
});

SECONDARY_BRAKE_OFF.onClick(() => {
  toggleSecBrake(false, true);
});

// // Sends command torque command on user click
// document.getElementById('cmdTorque').addEventListener('click', () => {
//   CLIENT.commandTorque();
// });

// // Sends HV enable command on user click and changes indicators
// document.getElementById('hvEnable').addEventListener('click', () => {
//   toggleConfirmationModal('high voltage systems?', () => {
//     document.getElementById('hvText').classList.add('active');
//     if (document.getElementById('hvDisText').classList.contains('active')) {
//       document.getElementById('hvDisText').classList.remove('active');
//     }
//     CLIENT.enableHV();
//   });
// });


// // Sends Latch on command on user click and confirm and changes indicators
// D.getElementById('latchOn').addEventListener('click', () => {
//   D.getElementById('latchOnText').style.color = 'red';
//   D.getElementById('latchOffText').style.color = 'white';
//   toggleConfirmationModal('turn on the MCU Latch?', () => {
//     CLIENT.toggleLatch(true);
//   });
// });

// // Runs disable HV function on user click
// document.getElementById('hvDisable').addEventListener('click', disableHV);

// // Toggles latch off on user click
// D.getElementById('latchOff').addEventListener('click', () => {
//   D.getElementById('latchOnText').style.color = 'white';
//   D.getElementById('latchOffText').style.color = 'red';
//   CLIENT.toggleLatch(false);
// });

// Starts the recording of data to dataRecording.js
DATA_RECORD_BUTTON.onClick(() => {
  if (!DATA_INTERFACING.isDataRecording) {
    DATA_INTERFACING.recordingEvent.emit('on'); // Tell DI to run start recording data
    console.log('recording data');
    DATA_RECORD_BUTTON.greyOut();
    ARCHIVE_BUTTON.colorize();
  } else {
    console.log('data is already being recorded');
  }
});

// Archives the data from dataRecording.js if data is being recorded
ARCHIVE_BUTTON.onClick(() => {
  if (DATA_INTERFACING.isDataRecording) {
    DATA_INTERFACING.recordingEvent.emit('off'); // Tells DI to stop recording data
    DATA_INTERFACING.archiveData();
    console.log('archiving data');
    DATA_RECORD_BUTTON.colorize();
    ARCHIVE_BUTTON.greyOut();
  } else {
    console.log('data was not being recorded');
  }
});


// Initilization
/**
 * Creates the states and state machine buttons
 */
function createStateMachineButtons() {
  return new Promise((resolve, reject) => {
    let parent = document.getElementById('statemachineBox');
    if (!parent) reject(new Error('Parent not found'));
    STATE_BUTTONS.forEach((state) => {
      let formattedText = state[0].replace(/ /g, '').toLowerCase();
      let newState = new State(formattedText, state[0], null, state[1], state[2], state[3]);
      newState.btn.setParent(parent);
      newState.btn.onClick(() => {
        overrideState(newState);
        newState.btn.activate();
      });
    });
    STATES[0].activate();
    resolve(STATES[0]);
  });
}

/**
 * Function to create the caches and tables and dropdowns of the dash
 */
function createDashboard() {
  return new Promise((resolve, reject) => {
    try {
      DATA_INTERFACING.createCache();
      DATA_INTERFACING.createCache(DATA_RECORDING);
      DYNAMIC_LOADING.fillAllItems();
      DYNAMIC_LOADING.fillAllTables();
    } catch (e) {
      reject(new Error(e));
    }
    resolve();
  });
}

/**
 * Function to run at start of dashboard
 */
function init() {
  createDashboard().then(() => { // First create the dashboard
    createStateMachineButtons().then(() => { // Then create all the state objects
      setInterval(podConnectionCheck, CONNECTION_CHECK_INTERVAL); // Finally set intervals
      // Autosaves on interval
      setInterval(autosave, AUTOSAVE_INTERVAL);
    }).catch((err) => {
      throw err;
    });
  });
  displayTimer(GLOBAL_TIMER);
  console.log(DEBUG);
}
// Run at init
init();

// Events

// Data in recieved
COMMUNICATIONS_EMITTER.on('dataIn', (input) => {
  if (DEBUG) console.log(input);
  checkPackets(input);
  let fixedPacket = checkBraking(input);
  DATA_INTERFACING.normalizePacket(fixedPacket);
  TABLES_RENDERER.lastRecievedTime = new Date().getTime();
});

COMMUNICATIONS_EMITTER.on('Lost', (ip) => {
  if (ip === CONSTANTS.lvBone.ip) {
    if (boneStatus[0]) console.error('lost LV bone');
    boneStatus[0] = false;
  }
  if (ip === CONSTANTS.hvBone.ip) {
    if (boneStatus[1]) console.error('lost LV bone');
    boneStatus[1] = false;
  }
});

COMMUNICATIONS_EMITTER.on('ok', (ip) => {
  if (ip === CONSTANTS.lvBone.ip) { boneStatus[0] = true; }
  if (ip === CONSTANTS.hvBone.ip) { boneStatus[1] = true; }
});

DATA_INTERFACING.packetHandler.on('renderData', () => {
  const renderable = DATA_INTERFACING.findRenderable();
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
