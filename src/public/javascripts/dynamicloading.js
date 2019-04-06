/*
Author: Eric Udlis, Luke Houge
Purpose: Dynamically fill the dashboard with content based off database.JSON
*/
const database = require('../../database.json');

console.log(database);

// Dynamic Tables

function createHeaderCol(name, group, units) {
  let header = document.createElement('td'); // Creates the actual DOM element
  header.className = `valueTable${group}`; // Sets the class
  let fixedUnits = ` (${units})`; // Adds parenthesis to the units string
  let fixedName = name.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2') + fixedUnits; // Splits the camel case into two words and adds the units
  fixedName = fixedName.charAt(0).toUpperCase() + fixedName.slice(1); // Capitalizes first letter
  header.innerHTML = `${fixedName}`; // Sets value in the box
  return header;
}


function createMinCol(name, group) {
  let col = document.createElement('td'); // Creates Element
  col.className = 'min'; // Assigns class
  col.id = `${name}Min`; // Assigns ID
  col.innerHTML = String(database[group][name].limits.idle.min); // Fills box with correct value
  return col;
}

function createActualCol(name) {
  let col = document.createElement('td');
  col.className = 'actual';
  col.id = `${name}`;
  return col;
}

function createMaxCol(name, group) {
  let col = document.createElement('td');
  col.className = 'max';
  col.id = `${name}Max`;
  col.innerHTML = `${database[group][name].limits.idle.max}`;
  return col;
}

// Uses above functions to create a row
function createRow(name, group, units) { // eslint-disable-line no-unused-vars
  let row = document.createElement('tr');

  let header = createHeaderCol(name, group, units);
  row.appendChild(header);

  let min = createMinCol(name, group);
  row.appendChild(min);

  let actual = createActualCol(name);
  row.appendChild(actual);

  let max = createMaxCol(name, group);
  row.appendChild(max);
  console.log(row);
  let table = document.getElementById(group);
  table.appendChild(row);
}

// Uses above functions to fill a table with rows
function fillTable(table) { // eslint-disable-line
  let currentSystem = database[table];
  sensors = Object.keys(currentSystem); // Create an array with all sensors in the subsystem

  sensors.forEach((sensor) => {
    createRow(`${sensor}`, table, `${currentSystem[sensor].units}`); // For each sensor create a row
  });
}

// Uses fillTable to fill every table
module.exports.fillAllTables = function fillAllTables() { // eslint-disable-line
  let subsystems = Object.keys(database); // Create array of each subsystem
  subsystems.forEach((subsystem) => {
    fillTable(`${subsystem}`); // For each subsystem create a table
  });
};

// Dynamic Loading of Maxs and Mins

function getMinCell(sensor) {
  return document.getElementById(`${sensor}Min`);
}

function getMaxCell(sensor) {
  return document.getElementById(`${sensor}Max`);
}

function setMinCell(sensor, value) {
  getMinCell(sensor).innerHTML = Number(value);
}

function setMaxCell(sensor, value) {
  getMaxCell(sensor).innerHTML = Number(value);
}

function fillRowBounds(subsystem, sensor, state) {
  let stored = database[subsystem][sensor].limits[state];
  setMinCell(sensor, stored.min);
  setMaxCell(sensor, stored.max);
}

function fillTableBounds(subsystem, state) {
  sensors = Object.keys(database[subsystem]);
  sensors.forEach((sensor) => {
    fillRowBounds(subsystem, sensor, state);
  });
}

module.exports.fillAllBounds = function fillAllBounds(state) { // eslint-disable-line no-unused-vars
  subsystems = Object.keys(database);
  subsystems.forEach((system) => {
    fillTableBounds(system, state);
  });
};

function getStateName(stateNum) {
  switch (stateNum) {
    default:
      return undefined;
    case 0:
      return 'powerOff';
    case 1:
      return 'idle';
    case 2:
      return 'readyForPumpdown';
    case 3:
      return 'pumpdown';
    case 4:
      return 'readyForPropulsion';
    case 5:
      return 'propulsion';
    case 6:
      return 'braking';
    case 7:
      return 'stopped';
    case 8:
      return 'crawl';
    case 9:
      return 'postRun';
    case 10:
      return 'safeToApproach';
  }
}

module.exports.switchState = function switchState(state) {
  stateStr = getStateName(state);
  stateNum = state;

  fillAllBounds();
};

// Dynamic Dropdowns


// code that actually creates the element with the passed in information from fillAllItems
function createItem(name, group, units) { // eslint-disable-line no-unused-vars
  let fixedUnits = ` (${units})`; // Adds parenthesis to the units string
  let fixedName = name.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2') + fixedUnits; // Splits the camel case into two words and adds the units
  fixedName = fixedName.charAt(0).toUpperCase() + fixedName.slice(1); // Capitalizes first letter

  let header = document.createElement('a'); // Creates the actual DOM element
  header.href = ''; // Sets the class
  switch (group) {
    case 'myDropdown1':
      header.onclick = function onclick() { // sets the onclick value
        clone(name);
        return false;
      };
      break;
    case 'myDropdown2':
      header.onclick = function onclick() { // sets the onclick value
        generateLineChartOne(name, fixedName);
        return false;
      };
      break;
    case 'myDropdown3':
      header.onclick = function onclick() { // sets the onclick value
        generateLineChartTwo(name, fixedName);
        return false;
      };
      break;
    default:
      break;
  }
  header.innerHTML = `${fixedName}`; // Sets value in the box
  let list = document.getElementById(group);
  list.appendChild(header);
}

//
module.exports.fillAllItems = function fillAllItems() { // eslint-disable-line
  let subsystems = Object.keys(database); // Create array of each subsystem
  subsystems.forEach((subsystem) => {
    let currentSystem = database[subsystem];
    sensors = Object.keys(currentSystem); // Create an array with all sensors in the subsystem

    sensors.forEach((sensor) => {
      createItem(`${sensor}`, 'myDropdown1', `${currentSystem[sensor].units}`); // For each sensor create an element
      createItem(`${sensor}`, 'myDropdown2', `${currentSystem[sensor].units}`); // For each sensor create an element
      createItem(`${sensor}`, 'myDropdown3', `${currentSystem[sensor].units}`); // For each sensor create an element
    });
  });
};
