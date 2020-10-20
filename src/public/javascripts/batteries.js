/**
 * Batteries Modules
 * @module Batteries
 */
const client = require('./../public/javascripts/communication').recievedEmitter;

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
class Battery {
  constructor(name, row, col) {
    this.name = name;
    this.voltage = 0.0;
    this.temperature = null;
    this.row = row;
    this.col = col;
  }

  setVoltage(voltage) {
    this.voltage = voltage;
  }

  setTemp(temp) {
    this.temperature = temp;
  }

  getVoltage() {
    return this.voltage.toFixed(4);
  }

  getTemp() {
    return this.temperature;
  }
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
  for (let i = 0; i < TABLE_HEIGHT; i++) {
    for (let j = 0; j < TABLE_WIDTH; j++) {
      let index = i * TABLE_WIDTH + j; // Calculates what your flattened index is
      console.log(`(${i}, ${j})`);
      batteries[index] = new Battery(`Cell ${index}`, i, j); // Adds cell in your 1d table
      fillCell(index, i, j); // Fills in the cell, and column math looks a lot
      // nicer because access is already in 2d
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
