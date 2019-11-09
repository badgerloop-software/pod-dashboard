const { remote } = require('electron');

const comms = require('./public/javascripts/communication');
const config = require('./public/javascripts/config');
const consts = require('./public/javascripts/config').constants;

const terminalInput = document.getElementById('terminalInputBox');
const terminalOutput = document.getElementById('terminalOutputList');

const settingsModal = document.querySelector('.settingsModal');
const settingsTrigger = document.querySelector('.settingsTrigger');
const settingsSubmit = document.getElementById('podSettingsSubmit');
const closeButton = document.querySelector('.close-button');

const electronWindow = remote.getCurrentWindow();
const terminalCommands = ['help', 'clear', 'runTest'];
let lastCommand = [];
let timesPressedUp = 0;

function recallLastCommand(index) {
  terminalInput.value = `${lastCommand[lastCommand.length - (1 + index)]}`;
}

function handleKeys() { // eslint-disable-line
  if (window.event.keyCode === 9) {
    return false;
  }
  if (window.event.keyCode === 38) {
    if (timesPressedUp < lastCommand.length) {
      recallLastCommand(timesPressedUp);
      timesPressedUp++;
    }
  }
  if (window.event.keyCode === 40) {
    if (timesPressedUp > 0) {
      timesPressedUp--;
      recallLastCommand(timesPressedUp);
    }
    if (timesPressedUp === -1) {
      terminalInput.value = null;
    }
  }
}

function createOutputLine(stg, echo) { // eslint-disable-line no-unused-vars
  let output = document.createElement('li');
  output.innerHTML = `$ ${stg}`;
  terminalOutput.appendChild(output);
}

function createOutputLineMessage(stg) { // eslint-disable-line no-unused-vars
  let output = document.createElement('li');
  output.innerHTML = stg;
  output.className = 'message';
  terminalOutput.appendChild(output);
}

function clearTerminal() {
  while (terminalOutput.hasChildNodes()) {
    terminalOutput.removeChild(terminalOutput.firstChild);
  }
}

function runHelp() {
  let outputString = 'Current commands are ';
  outputString = outputString.concat(terminalCommands);
  createOutputLineMessage(outputString);
  createOutputLineMessage(`Test Numbers are: \n
  1 Print Test <for testing> \n
  2 Nav Test \n
  3 State Test \n
  4 Braking Test \n
  5 BMS Display \n
  6 Solenoid Test `);
}

function sendTest(input) {
  console.log('Sending Test Command');
  let num = input.substring(7);
  let command = `test ${num}`;
  comms.sendHVCommand(command);
}

function unknownCommand() {
  createOutputLineMessage('Unrecognized Command');
}

function runTerminalCommand(command) {
  if (command === 'help') {
    runHelp();
  }
  if (command === 'clear') {
    clearTerminal();
  }
  if (command.startsWith('runTest')) {
    sendTest(command);
  }
}


function handleInput() {
  let inputText = terminalInput.value;
  let isTerminalCommand = false;
  timesPressedUp = 0;
  lastCommand.push(inputText);
  createOutputLine(inputText, true);
  terminalCommands.forEach((command) => {
    if (inputText.startsWith(command)) isTerminalCommand = true;
  });
  if (isTerminalCommand) {
    runTerminalCommand(inputText);
  } else {
    unknownCommand();
  }
  terminalInput.value = '';
  let lineBreak = document.createElement('br');
  terminalOutput.appendChild(lineBreak);
}


terminalInput.addEventListener('keyup', (event) => {
  if (event.keyCode === 13) {
    event.preventDefault();
    handleInput();
  }
});

// Window Handling

document.getElementById('min-window').addEventListener('click', () => {
  electronWindow.minimize();
});

document.getElementById('max-window').addEventListener('click', () => {
  if (!electronWindow.isMaximized()) electronWindow.maximize();
  else electronWindow.unmaximize();
});

document.getElementById('close-window').addEventListener('click', () => {
  electronWindow.close();
});


// UI Stuff

function toggleSettingsModal() {
  settingsModal.classList.toggle('show-modal');
  fillConstants(); // eslint-disable-line no-use-before-define
}
settingsTrigger.addEventListener('click', toggleSettingsModal);
closeButton.addEventListener('click', toggleSettingsModal);

// Submits Entries to File
settingsSubmit.addEventListener('click', () => {
  let constsCache = {
    dataSendRate: null,
    renderInterval: null,
    serverAddr: {
      ip: null,
      port: null,
    },
    hvBone: {
      ip: null,
      port: null,
    },
    lvBone: {
      ip: null,
      port: null,
    },
  };
  constsCache.serverAddr.ip = document.getElementById('podIP').value;
  constsCache.serverAddr.port = Number(document.getElementById('podPort').value);
  constsCache.dataSendRate = Number(document.getElementById('scanningRate').value);
  constsCache.hvBone.ip = document.getElementById('hvBoneIP').value;
  constsCache.hvBone.port = Number(document.getElementById('hvBonePort').value);
  constsCache.lvBone.ip = document.getElementById('lvBoneIP').value;
  constsCache.lvBone.port = Number(document.getElementById('lvBonePort').value);
  constsCache.renderInterval = Number(document.getElementById('renderInterval').value);
  document.getElementById('formFeedback').innerHTML = config.writeJSON(constsCache);
  electronWindow.reload();
});

// Fills entries in text boxes
function fillConstants() { // eslint-disable-line no-unused-vars
  config.updateConstants();
  document.getElementById('formFeedback').innerHTML = 'Will restart for changes to take place.';
  document.getElementById('podIP').value = String(consts.serverAddr.ip);
  document.getElementById('podPort').value = consts.serverAddr.port;
  document.getElementById('scanningRate').value = consts.dataSendRate;
  document.getElementById('lvBoneIP').value = consts.lvBone.ip;
  document.getElementById('lvBonePort').value = consts.lvBone.port;
  document.getElementById('hvBoneIP').value = consts.hvBone.ip;
  document.getElementById('hvBonePort').value = consts.hvBone.port;
  document.getElementById('renderInterval').value = consts.renderInterval;
}

//Torque Value Submission

document.getElementById('torqueSendButton').addEventListener('click', () => { 
  comms.sendHVCommand('setTorque' + document.getElementById('torqueInput').innerHTML);
});
document.getElementById('torqueUpButton').addEventListener('click', incrementTorqueValue);
document.getElementById('torqueDownButton').addEventListener('click', decrementTorqueValue);

function incrementTorqueValue() {
  document.getElementById('torqueInput').innerHTML++;
}

function decrementTorqueValue() {
  document.getElementById('torqueInput').innerHTML--;
}