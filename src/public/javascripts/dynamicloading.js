/* eslint-disable no-param-reassign */
/**
 * @module Dynamic-Loading
 * @author Eric Udlis, Luke Houge
 * @description Dynamically fill the dashboard with content based off of database.JSON
 */

/** @requires module:DataInterfacing */
const DATA_INTERFACING = require('./datainterfacing');

const DEFAULT_STATE = 'poweroff';
// Dynamic Tables
/**
 * Creates the name column for the sensor
 * @param {String} name The name of the sensor
 * @param {String} group The group it belongs to
 * @param {String} units The units it's displayed to
 * @returns {HTMLElement} The table column
 */
function createHeaderCol(name, group, units) {
  let header = document.createElement('td'); // Creates the actual DOM element
  header.className = `valueTable${group}`; // Sets the class
  let fixedUnits = ` (${units})`; // Adds parenthesis to the units string
  let fixedName = name.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2') + fixedUnits; // Splits the camel case into two words and adds the units
  fixedName = fixedName.charAt(0).toUpperCase() + fixedName.slice(1); // Capitalizes first letter
  header.innerHTML = `${fixedName}`; // Sets value in the box
  return header;
}

/**
 * Creates the minimum value column for a sensor
 * @param {String} name The name of the sensor
 * @param {String} group The group it belongs to
 * @returns {HTMLElement} The table column
 */
function createMinCol(name, group) {
  if (typeof name !== 'string') throw new Error('Error: Name must be a string');
  let renderable = DATA_INTERFACING.findRenderable();
  if (!renderable[group]) throw new Error('Error: Group is not found in renderable list');
  let col = document.createElement('td'); // Creates Element
  col.className = 'min'; // Assigns class
  col.id = `${name}Min`; // Assigns ID
  // Fills box with correct value
  col.innerHTML = String(renderable[group][name].limits[DEFAULT_STATE].min);
  return col;
}

/**
 * Creates the actual value coluumn for a sensor
 * @param {String} name The name of the sensor
 * @returns {HTMLElement} The table column
 */
function createActualCol(name) {
  let col = document.createElement('td');
  col.className = 'actual';
  col.id = `${name}`;
  return col;
}

/**
 * Creates the maximum value column for a sensor
 * @param {String} name The name of the sensor
 * @param {String} group The group the sensor belongs to
 */
function createMaxCol(name, group) {
  let renderable = DATA_INTERFACING.findRenderable();
  let col = document.createElement('td');
  col.className = 'max';
  col.id = `${name}Max`;
  col.innerHTML = `${renderable[group][name].limits[DEFAULT_STATE].max}`;
  return col;
}

/**
 * Creates a table row with a name, min, actual, and max column and appends it to specified table
 * @param {String} name The name of the sensor
 * @param {String} group The group the sensor belogns to
 * @param {String} units The units to display in
 */
function createRow(name, group, units) {
  this.group = group;
  let row = document.createElement('tr');

  let header = createHeaderCol(name, group, units);
  row.appendChild(header);

  let min = createMinCol(name, group);
  row.appendChild(min);

  let actual = createActualCol(name);
  row.appendChild(actual);

  let max = createMaxCol(name, group);
  row.appendChild(max);
  if (group === 'braking') this.group = 'braking_table';
  let table = document.getElementById(this.group);
  table.appendChild(row);
}

/**
 * Fills a table with rows
 * @param {String} table The name of the group/table to fill
 */
function fillTable(table) { // eslint-disable-line
  let renderable = DATA_INTERFACING.findRenderable();
  let currentSystem = renderable[table];
  sensors = Object.keys(currentSystem); // Create an array with all sensors in the subsystem

  sensors.forEach((sensor) => {
    createRow(`${sensor}`, table, `${currentSystem[sensor].units}`); // For each sensor create a row
  });
}

/**
 * Fills all tables on the dashboard
 */
module.exports.fillAllTables = function fillAllTables() { // eslint-disable-line
  let renderable = DATA_INTERFACING.findRenderable();
  let subsystems = Object.keys(renderable); // Create array of each subsystem
  subsystems.forEach((subsystem) => {
    fillTable(`${subsystem}`); // For each subsystem create a table
  });
  console.log('Sucessfully Initiated Tables');
};

// Dynamic Loading of Maxs and Mins
/**
 * Returns the div of the column that contains text
 * @param {String} sensor Name of sensor
 * @returns {HTMLElement} The div the contains value text
 */
function getMinCell(sensor) {
  let domEle = document.getElementById(`${sensor}Min`) || -1;
  return domEle;
}

/**
 * Returns the div of the column that contains text
 * @param {String} sensor Name of sensor
 * @returns {HTMLElement} The div the contains value text
 */
function getMaxCell(sensor) {
  let domEle = document.getElementById(`${sensor}Max`) || -1;
  return domEle;
}

/**
 * Sets the text of the minimum value column for a row
 * @param {String} sensor Name of sensor
 * @param {Number} value Value to set
 */
function setMinCell(sensor, value) {
  if (getMinCell(sensor) === -1) console.warn(`Warning: Sensor ${sensor} does not have a place on table`);
  else getMinCell(sensor).innerHTML = Number(value);
}

/**
 * Sets the text of the maximum value column for a row
 * @param {String} sensor Name of sensor
 * @param {Number} value Value to set
 */
function setMaxCell(sensor, value) {
  if (getMaxCell(sensor) === -1) console.warn(`Warning: Sensor ${sensor} does not have a place on table`);
  else getMaxCell(sensor).innerHTML = Number(value);
}

/**
 * Fills a row's nomimal values
 * @param {String} subsystem The group the sensor belongs to
 * @param {String} sensor The name of the sensor
 * @param {String} state The state which bounds are being filled
 */
function fillRowBounds(subsystem, sensor, state) {
  let renderable = DATA_INTERFACING.findRenderable();
  let stored = renderable[subsystem][sensor].limits[state];
  if (!stored) throw new Error(`Error: Can not find limits for ${sensor} at state ${state}`);
  setMinCell(sensor, stored.min);
  setMaxCell(sensor, stored.max);
}

/**
 * Fills a table's nominal values
 * @param {String} subsystem The table to fill
 * @param {String} state The state which bounds are being filled
 */
function fillTableBounds(subsystem, state) {
  let renderable = DATA_INTERFACING.findRenderable();
  sensors = Object.keys(renderable[subsystem]);
  sensors.forEach((sensor) => {
    // console.log(`Starting ${sensor}`);
    fillRowBounds(subsystem, sensor, state);
    // console.log(`Finised ${sensor}`);
  });
}

/**
 * Fills all tables nominal values
 * @param {String} state
 */
function fillAllBounds(state) { // eslint-disable-line no-unused-vars
  let renderable = DATA_INTERFACING.findRenderable();
  subsystems = Object.keys(renderable);
  subsystems.forEach((system) => {
    // console.log(`Starting ${system}`);
    fillTableBounds(system, state);
    // console.log(`Finised ${system}`);
  });
}

module.exports.fillAllBounds = fillAllBounds;