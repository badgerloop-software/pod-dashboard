const NUM_BATTERIES = 72;
const Battery = require('./public/javascripts/Battery');
const client = require('./public/javascripts/communication').recievedEmitter;

const TABLE = document.getElementById('batteryTable');

let batteries = [];

function createRow(rowNum, numCells) {
  let row = document.createElement('tr');
  for (let i = 0; i < numCells; i++) {
    let cell = document.createElement('td');
    cell.id = `${rowNum}${i}cell`;
    row.appendChild(cell);
  }
  TABLE.appendChild(row);
}

function createTable(numRows, numCells) {
  for (let i = 0; i < numRows; i++) {
    createRow(i, numCells);
  }
}
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
function initBatteries() {
  createTable(9, 8);
  for (let i = 0; i < NUM_BATTERIES; i++) {
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
      batteries[i] = new Battery(`Cell ${i}`, 4, (i - 32));
      fillCell(i, 5, (i - 40));
    }
    if (i >= 48 && i <= 55) {
      batteries[i] = new Battery(`Cell ${i}`, 5, (i - 48));
      fillCell(i, 6, (i - 48));
    }
    if (i >= 56 && i <= 63) {
      batteries[i] = new Battery(`Cell ${i}`, 6, (i - 56));
      fillCell(i, 7, (i - 56));
    }
    if (i >= 64 && i <= 71) {
      batteries[i] = new Battery(`Cell ${i}`, 7, (i - 64));
      fillCell(i, 8, (i - 64));
    }
  }
}

window.onload = initBatteries;

function updateCell(batteryIndex) {
  let cell = batteries[batteryIndex];
  let voltage = document.getElementById(`${cell.row}${cell.col}volt`);
  voltage.innerHTML = `Voltage: ${cell.getVoltage()}`;
}

function updateBattery(batteryIndex, voltage) {
  let cell = batteries[batteryIndex];
  cell.setVoltage(voltage);
}

function updateBatteryAndRender(batteryIndex, voltage) {
  updateBattery(batteryIndex, voltage);
  updateCell(batteryIndex);
}

function updateTemps(min, avg, max) {
  document.getElementById('temps').innerHTML = `Min Cell Temp: ${min}   Avg Cell Temp: ${avg}   Max Cell Temp: ${max}`;
}

client.on('dataIn', (input) => {
  // TODO: Figure out how Ezra/ Shelby is sending me this shit
});
