/**
 * Batteries Modules
 * @module Batteries
 */
const client = require('./public/javascripts/communication').recievedEmitter;

/** @constant {Number} - Width of battery table */
const TABLE_WIDTH = 8;

/** @constant {Number} - Height of battery table */
const TABLE_HEIGHT = 9;

/** @constant {Number} - Number of Cells to be in Battery Index */
const NUM_CELLS = TABLE_WIDTH * TABLE_HEIGHT;

/** @constant {Number} - Maximum nominal voltage */
const MAX_VOLTAGE = 4.2;

/** @constant {Number} - Minimum nominal voltage */
const MIN_VOLTAGE = 3.1;

/** @constant {HTMLElement} - HTML Element of Table */
const TABLE = document.getElementById('batteryTable');

let batteries = [];
/**
 * Represents a single battery cell
 * @constructor
 * @param {String} name - name of battery cell
 * @param {Number} row - row it belongs to
 * @param {Number} col - column it belongs to
 */
function Battery(name, row, col) {
  this.name = name;
  this.voltage = 0.0;
  this.temperature = null;
  this.row = row;
  this.col = col;

  this.setVoltage = function setVoltage(voltage) {
    this.voltage = voltage;
  };

  this.setTemp = function setTemp(temp) {
    this.temperature = temp;
  };

  this.getVoltage = function getVoltage() {
    return this.voltage.toFixed(4);
  };

  this.getTemp = function getTemp() {
    return this.temperature;
  };
}
/**
 * Creates a row filled with battery cells
 * @param {Number} rowNum - Row number to create
 * @param {Number} numCells - Number of cells in row to create
 */
function createRow(rowNum, numCells) {
  let row = document.createElement('tr');
  for (let i = 0; i < numCells; i++) {
    let cell = document.createElement('td');
    cell.id = `${rowNum}${i}cell`;
    row.appendChild(cell);
  }
  TABLE.appendChild(row);
}

/**
 * Creates battery table
 * @param {Number} numRows - Number of rows in table
 * @param {*} numCells - Number of cells per row
 */
function createTable(numRows, numCells) {
  for (let i = 0; i < numRows; i++) {
    createRow(i, numCells);
  }
}

/**
 * Fills cell with battery cell data
 * @param {Number} batteryIndex - Index of battery to fill
 * @param {Number} row - Row of cell to fill
 * @param {Number} col - Column of cell to fill
 */
function fillCell(batteryIndex, row, col) {
  cell = document.getElementById(`${row}${col}cell`);
  let list = document.createElement('ul');
  let header = document.createElement('li');
  header.innerHTML = `<b>${batteries[batteryIndex].name}</b>`;
  list.appendChild(header);
  let voltage = document.createElement('li');
  voltage.id = `${row}${col}volt`;
  voltage.innerHTML = `Voltage: ${batteries[batteryIndex].getVoltage()}`;
  list.appendChild(voltage);
  cell.appendChild(list);
}

/**
 * Creates table of batteries with given dimentions
 */
function initBatteries() {
  createTable(TABLE_HEIGHT, TABLE_WIDTH);
  for (let i = 0; i < NUM_CELLS; i++) {
    if (i >= 0 && i <= 7) {
      batteries[i] = new Battery(`Cell ${i}`, 0, i);
      fillCell(i, 0, (i));
    }
    if (i >= 8 && i <= 15) {
      batteries[i] = new Battery(`Cell ${i}`, 1, (i - 8));
      fillCell(i, 1, (i - 8));
    }
    if (i >= 16 && i <= 23) {
      batteries[i] = new Battery(`Cell ${i}`, 2, (i - 16));
      fillCell(i, 2, (i - 16));
    }
    if (i >= 24 && i <= 31) {
      batteries[i] = new Battery(`Cell ${i}`, 3, (i - 24));
      fillCell(i, 3, (i - 24));
    }
    if (i >= 32 && i <= 39) {
      batteries[i] = new Battery(`Cell ${i}`, 4, (i - 32));
      fillCell(i, 4, (i - 32));
    }
    if (i >= 40 && i <= 47) {
      batteries[i] = new Battery(`Cell ${i}`, 5, (i - 40));
      fillCell(i, 5, (i - 40));
    }
    if (i >= 48 && i <= 55) {
      batteries[i] = new Battery(`Cell ${i}`, 6, (i - 48));
      fillCell(i, 6, (i - 48));
    }
    if (i >= 56 && i <= 63) {
      batteries[i] = new Battery(`Cell ${i}`, 7, (i - 56));
      fillCell(i, 7, (i - 56));
    }
    if (i >= 64 && i <= 71) {
      batteries[i] = new Battery(`Cell ${i}`, 8, (i - 64));
      fillCell(i, 8, (i - 64));
    }
  }
}

// Run this function on window load
window.onload = initBatteries;
/**
 * Update table cell with battery cell info
 * @param {Number} batteryIndex index of battery
 */
function updateCell(batteryIndex) {
  let cell = batteries[batteryIndex];
  let voltage = document.getElementById(`${cell.row}${cell.col}volt`);
  voltage.innerHTML = `Voltage: ${cell.getVoltage()}`;
}

/**
 * Updates battery cell with voltage
 * @param {Number} batteryIndex Index of battery to update
 * @param {Number} voltage Voltage to put into battery
 */
function updateBattery(batteryIndex, voltage) {
  let cell = batteries[batteryIndex];
  cell.setVoltage(voltage);
}

/**
 * Updates battery cell with voltage and renders it on the table
 * @param {Number} batteryIndex Index of battery to update
 * @param {Number} voltage Voltage to put into battery
 */
function updateBatteryAndRender(batteryIndex, voltage) {
  updateBattery(batteryIndex, voltage);
  updateCell(batteryIndex);
}

/**
 * Updates the label at bottom of screen with temperatures
 * @param {Number} min Minimum temperature of battery pack
 * @param {Number} avg Average temperature of battery pack
 * @param {Number} max Maximum termperature of battery pack
 */
function updateTemps(min, avg, max) {
  document.getElementById('temps').innerHTML = `Min Cell Temp: ${min} C   Avg Cell Temp: ${avg} C   Max Cell Temp: ${max} C`;
}

/**
 * Checks if a cell's voltage is within the nominal values
 */
function checkMinMax() {
  let cell;
  let tableCell;
  let voltNum;
  for (let i = 0; i < NUM_CELLS; i++) {
    cell = batteries[i];
    // console.log(cell);
    tableCell = document.getElementById(`${cell.row}${cell.col}volt`).innerHTML;
    voltNum = Number(tableCell.substr(9));
    // console.log(`${i} ${tableCell}`);
    if (voltNum <= MIN_VOLTAGE || voltNum >= MAX_VOLTAGE) {
      document.getElementById(`${cell.row}${cell.col}cell`).style.backgroundColor = 'red';
    } else {
      document.getElementById(`${cell.row}${cell.col}cell`).style.backgroundColor = 'green';
    }
  }
}
// Check on given interval
setInterval(checkMinMax, 1000);

// On data in update and render voltages/ temps
client.on('dataIn', (input) => {
  console.log(input);
  if (input.battery.cells) {
    let cells = [];
    for (let i = 0; i < input.battery.cells.length; i++) {
      cells[i] = input.battery.cells[i];
    }
    for (let i = 0; i < cells.length; i++) {
      console.log(`index ${i} volts ${cells[i]}`);
      updateBatteryAndRender(i, cells[i]);
    }
    updateTemps(input.battery.minCellTemp, input.battery.avgCellTemp, input.battery.maxCellTemp);
  }
});
