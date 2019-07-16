const { remote } = require('electron');

const comms = require('./public/javascripts/communication');

const terminalInput = document.getElementById('terminalInputBox');
const terminalOutput = document.getElementById('terminalOutputList');
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
  4 Braking Test \n `);
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
