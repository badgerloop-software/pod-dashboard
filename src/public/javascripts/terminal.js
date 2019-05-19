const terminalInput = document.getElementById('terminalInputBox');
const terminalOutput = document.getElementById('terminalOutputList');

const terminalCommands = ['help', 'clear'];


function createOutputLine(stg, echo) {
  let output = document.createElement('li');
  output.innerHTML = stg;
  if (echo) output.className = 'echo';
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
  createOutputLine(outputString);
}

function unknownCommand() {
  createOutputLine('Unrecognized Command');
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
}


terminalInput.addEventListener('keyup', (event) => {
  if (event.keyCode === 13) {
    event.preventDefault();
    handleInput();
  }
});
