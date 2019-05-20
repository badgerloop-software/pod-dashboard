const terminalInput = document.getElementById('terminalInputBox');
const terminalOutput = document.getElementById('terminalOutputList');

const terminalCommands = ['help', 'clear'];


function createOutputLine(stg, echo) {
  let output = document.createElement('li');
  output.innerHTML = '$ ' + stg;
  terminalOutput.appendChild(output);
}

function createOutputLineMessage(stg, echo) {
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
}


function handleInput() {
  let inputText = terminalInput.value;
  let isTerminalCommand = false;
  createOutputLine(inputText, true);
  terminalCommands.forEach((command) => {
    if (inputText === command) isTerminalCommand = true;
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
