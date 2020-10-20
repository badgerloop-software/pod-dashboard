/**
 * @module TestingTool
 * @author Eric Udlis
 * @description The backend of the testing tool
 */
const FS = require('fs');
const DYNAMIC_LOADING = require('../public/javascripts/dynamicloading');

const FILE_SELECTOR = document.getElementById('fileSelector');
const FILE_INPUT = document.getElementById('file-input');
const FORWARD_BUTTON = document.getElementById('forward');
const BACKWARDS_BUTTON = document.getElementById('back');
const TIME_LABEL = document.getElementById('currentTime');
const MAX_TIME_LABEL = document.getElementById('maxTime');
const PLAY_BUTTON = document.getElementById('play');
const PAUSE_BUTTON = document.getElementById('pause');
const RESET_BUTTON = document.getElementById('reset');
const SCRUBBER = document.getElementById('scrubber');
let runData = null;
let runMax = 'No File Loaded';
let maxReached = false;
let currentTime = 0;
let timer;
let isPlaying = false;


// Timer
/**
 * Increments internal timer by 1
 */
function incrementTimer() {
  console.log(currentTime);
  currentTime = parseFloat(currentTime) + 1;
}

/**
 * If not playing data and has data start playing
 */
function playTimer() {
  if (runData && !isPlaying) {
    timer = setInterval(incrementTimer, 100);
    isPlaying = true;
    console.log(currentTime);
  }
  // if (chartInterval1 || chartInterval2) getDataAtInterval();
}

/**
 * Pause timer and set falg to false
 */
function pauseTimer() {
  clearInterval(timer);
  isPlaying = false;
  pauseCharts();
}

/**
 * Resets timer back to 0
 */
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
/**
 * Sets current time to scrubber value
 */
function updateScrubber() { // eslint-disable-line
  let v = SCRUBBER.value;
  console.log(`Scrubber is updating to ${v}`);
  currentTime = v;
  console.log(currentTime);
}

/**
 * Sets scrubber value to current time
 */
function fillScrubber() {
  SCRUBBER.setAttribute('max', runMax - 1);
}

// File Handling
/**
 * Finds the number of data points in a sensor
 */
function findMax() {
  let subsystemArray = Object.values(runData);
  let sensorArray = Object.values(subsystemArray[0]);
  let sampleSensor = sensorArray[0];
  runMax = sampleSensor.length - 1;
  MAX_TIME_LABEL.innerHTML = `${runMax}`;
  fillScrubber();
}

/**
 * Reads the file and sets runData to the JSON output
 * @param {File} file The file to read
 */
function importJSON(file) {
  let rawData = FS.readFileSync(`${file.path}`);
  runData = JSON.parse(rawData);
  console.log(runData);
  findMax();
}

/**
 * Filters the files from the input
 */
function handleFiles() {
  const fileList = this.files;
  importJSON(fileList[0]);
}

// Filling Tables
/**
 * Fills a cell with a data from a specific time
 * @param {String} subsystem The Subsystem Table to fill
 * @param {String} sensor The sensor to fill
 * @param {Number} time The time in the data to fill
 */
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

/**
 * Fills a table with data from a specific time
 * @param {String} subsystem The subsystem table to fill
 * @param {Number} time the time the data is located
 */
function fillTable(subsystem, time) {
  let sensors = Object.keys(runData[subsystem]);
  sensors.forEach((sensor) => {
    if (!document.getElementById(`${sensor}`)) return;
    fillCell(`${subsystem}`, `${sensor}`, time);
  });
}

/**
 * Fills all tables with data from a specific time
 * @param {Number} time the time the data is located
 */
function fillAllTables(time) {
  let subsystems = Object.keys(runData);
  subsystems.forEach((system) => {
    fillTable(`${system}`, time);
  });
}

/**
 * If there is run data fill all tables and update labels
 */
function updateTables() {
  if (runData) { fillAllTables(currentTime); }
  TIME_LABEL.innerHTML = `Current Time: ${currentTime} Frames | ${currentTime / 10} Seconds`;
  MAX_TIME_LABEL.innerHTML = `Total Time: ${runMax} Frames | ${runMax / 10} Seconds`;
}
setInterval(updateTables, 100);

// Event Listeners
FORWARD_BUTTON.addEventListener('click', () => { currentTime += 1; });
BACKWARDS_BUTTON.addEventListener('click', () => { currentTime -= 1; });
RESET_BUTTON.addEventListener('click', resetTimer);
PLAY_BUTTON.addEventListener('click', playTimer);
PAUSE_BUTTON.addEventListener('click', pauseTimer);
FILE_INPUT.addEventListener('change', handleFiles, false);
FILE_SELECTOR.addEventListener('click', () => { FILE_INPUT.click(); });

// Init
/**
 * Fills all tables and dropdowns
 */
function init() {
  DYNAMIC_LOADING.fillAllTables();
  DYNAMIC_LOADING.fillAllItems(true);
}
init();
// End Init
