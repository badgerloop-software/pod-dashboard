const fs = require('fs');
const dl = require('./public/javascripts/dynamicLoading');

const fileSelector = document.getElementById('fileSelector');
const fileInput = document.getElementById('file-input');
const fButton = document.getElementById('forward');
const bButton = document.getElementById('back');
const timeID = document.getElementById('currentTime');
const maxID = document.getElementById('maxTime');
const play = document.getElementById('play');
const pause = document.getElementById('pause');
const reset = document.getElementById('reset');
let runData = null;
let runMax = 'No File Loaded';
let maxReached = false;
let currentTime = 0;
let timer;


// Timer
function incrementTimer() {
  currentTime += 1;
}

function playTimer() {
  if (runData) timer = setInterval(incrementTimer, 100);
}

function pauseTimer() {
  clearInterval(timer);
}

function resetTimer() {
  pauseTimer();
  currentTime = 0;
}

// Check Timer for hitting Max

setInterval(() => {
  if (maxReached) {
    pauseTimer();
    maxReached = false;
  }
}, 100);

// File Handling
function findMax() {
  let subsystemArray = Object.values(runData);
  let sensorArray = Object.values(subsystemArray[0]);
  let sampleSensor = sensorArray[0];
  runMax = sampleSensor.length - 1;
  maxID.innerHTML = `${runMax}`;
}
function importJSON(file) {
  let rawData = fs.readFileSync(`${file.path}`);
  runData = JSON.parse(rawData);
  console.log(runData);
  findMax();
}
function handleFiles() {
  const fileList = this.files;
  importJSON(fileList[0]);
}

// Filling Tables
function fillCell(subsystem, sensor, time) {
  if (time >= runMax) {
    maxReached = true;
    currentTime = runMax;
  } else {
    const t = document.getElementById(`${sensor}`);
    let s = null;
    if (runData) {
      s = runData[subsystem][sensor];
      t.innerHTML = `${s[time]}`;
    } else {
      console.log('Error - No Data');
    }
  }
}
function fillTable(subsystem, time) {
  let sensors = Object.keys(runData[subsystem]);
  sensors.forEach((sensor) => {
    fillCell(`${subsystem}`, `${sensor}`, time);
  });
}
function fillAllTables(time) {
  let subsystems = Object.keys(runData);
  subsystems.forEach((system) => {
    fillTable(`${system}`, time);
  });
}

function updateTables() {
  if (runData) { fillAllTables(currentTime); }
  timeID.innerHTML = `Current Time: ${currentTime} Frames | ${currentTime / 10} Seconds`;
  maxID.innerHTML = `Total Time: ${runMax} Frames | ${runMax / 10} Seconds`;
}
setInterval(updateTables, 100);

// Event Listeners
fButton.addEventListener('click', () => { currentTime += 1; });
bButton.addEventListener('click', () => { currentTime -= 1; });
reset.addEventListener('click', resetTimer);
play.addEventListener('click', playTimer);
pause.addEventListener('click', pauseTimer);
fileInput.addEventListener('change', handleFiles, false);
fileSelector.addEventListener('click', () => {
  console.log('click');
  fileInput.click();
});

function init() {
  dl.fillAllTables();
}

// Init
init();
// End Init
