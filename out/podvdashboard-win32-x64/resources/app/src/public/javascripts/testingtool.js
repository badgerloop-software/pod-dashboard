const fs = require('fs');
const dl = require('./public/javascripts/dynamicloading');

const fileSelector = document.getElementById('fileSelector');
const fileInput = document.getElementById('file-input');
const fButton = document.getElementById('forward');
const bButton = document.getElementById('back');
const timeID = document.getElementById('currentTime');
const maxID = document.getElementById('maxTime');
const play = document.getElementById('play');
const pause = document.getElementById('pause');
const reset = document.getElementById('reset');
const scrubber = document.getElementById('scrubber');
let runData = null;
let runMax = 'No File Loaded';
let maxReached = false;
let currentTime = 0;
let timer;
let isPlaying = false;


// Timer
function incrementTimer() {
  console.log(currentTime);
  currentTime = parseFloat(currentTime) + 1;
}

function playTimer() {
  if (runData && !isPlaying) {
    timer = setInterval(incrementTimer, 100);
    isPlaying = true;
    console.log(currentTime);
  }
  // if (chartInterval1 || chartInterval2) getDataAtInterval();
}

function pauseTimer() {
  clearInterval(timer);
  isPlaying = false;
  pauseCharts();
}

function resetTimer() {
  pauseTimer();
  currentTime = 0;
}

// Check Timer for hitting Max

setInterval(() => {
  console.log(currentTime);
  if (maxReached) {
    pauseTimer();
    maxReached = false;
  }
}, 100);

// Scrubber
function updateScrubber() { // eslint-disable-line
  let v = scrubber.value;
  console.log(`Scrubber is updating to ${v}`);
  currentTime = v;
  console.log(currentTime);
}

function fillScrubber() {
  scrubber.setAttribute('max', runMax - 1);
}

// File Handling
function findMax() {
  let subsystemArray = Object.values(runData);
  let sensorArray = Object.values(subsystemArray[0]);
  let sampleSensor = sensorArray[0];
  runMax = sampleSensor.length - 1;
  maxID.innerHTML = `${runMax}`;
  fillScrubber();
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
  // console.log(`Starting ${sensor}`);
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
  // console.log(`Finished ${sensor}`);
}
function fillTable(subsystem, time) {
  let sensors = Object.keys(runData[subsystem]);
  sensors.forEach((sensor) => {
    if (!document.getElementById(`${sensor}`)) return;
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
fileSelector.addEventListener('click', () => { fileInput.click(); });

// Init
function init() {
  dl.fillAllTables();
  dl.fillAllItems(true);
}
init();
// End Init
