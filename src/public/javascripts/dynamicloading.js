/**
 * @module Dynamic-Loading
 * @author Eric Udlis, Luke Houge
 * @description Dynamically fill the dashboard with content based off of database.JSON
 */

/** @requires module:jsons-database */
const DATABASE = require('../../database.json');

/** @requires module:DataInterfacing */
const DATA_INTERFACING = require('./datainterfacing');

/** @requires module:Timer @see module:Timer */
const TIMER = require('./Timer');

const STATE_TIMER = new TIMER();

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
  let renderable = DATA_INTERFACING.findRenderable();
  let col = document.createElement('td'); // Creates Element
  col.className = 'min'; // Assigns class
  col.id = `${name}Min`; // Assigns ID
  // Fills box with correct value
  col.innerHTML = String(renderable[group][name].limits.powerOff.min);
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
  col.innerHTML = `${renderable[group][name].limits.powerOff.max}`;
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
  return document.getElementById(`${sensor}Min`);
}

/**
 * Returns the div of the column that contains text
 * @param {String} sensor Name of sensor
 * @returns {HTMLElement} The div the contains value text
 */
function getMaxCell(sensor) {
  return document.getElementById(`${sensor}Max`);
}

/**
 * Sets the text of the minimum value column for a row
 * @param {String} sensor Name of sensor
 * @param {Number} value Value to set
 */
function setMinCell(sensor, value) {
  getMinCell(sensor).innerHTML = Number(value);
}

/**
 * Sets the text of the maximum value column for a row
 * @param {String} sensor Name of sensor
 * @param {Number} value Value to set
 */
function setMaxCell(sensor, value) {
  getMaxCell(sensor).innerHTML = Number(value);
}

/**
 * Fills a row's nomimal values
 * @param {String} subsystem The group the sensor belongs to
 * @param {String} sensor The name of the sensor
 * @param {String} state The state which bounds are being filled
 */
function fillRowBounds(subsystem, sensor, state) {
  let renderable = DATA_INTERFACING.findRenderable();
  console.log(state);
  let stored = renderable[subsystem][sensor].limits[state];
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

/**
 * Turns a state number into a state string
 * @param {Number} stateNum State number
 */
function getStateName(stateNum) {
  switch (stateNum) {
    case 0:
      return 'powerOff';
    case 1:
      return 'idle';
    case 2:
      return 'pumpdown';
    case 3:
      return 'propulsion';
    case 4:
      return 'braking';
    case 5:
      return 'stopped';
    case 6:
      return 'crawlPrecharge';
    case 7:
      return 'crawl';
    case 8:
      return 'postRun';
    case 9:
      return 'safeToApproach';
    case 10:
      return 'nonRunFault';
    case 11:
      return 'runFault';
    case 12:
      return 'brakingFault';
    default:
      return undefined;
  }
}

/**
 * Sets all state buttons to inactive
 */
function resetAllButtons() {
  // document.getElementById('powerOff').className = 'stateButtonInactive';
  // document.getElementById('idle').className = 'stateButtonInactive';
  // document.getElementById('postRun').className = 'stateButtonInactive';
  // document.getElementById('pumpdown').className = 'stateButtonInactive';
  // document.getElementById('propulsion').className = 'stateButtonInactive';
  // document.getElementById('braking').className = 'stateButtonInactive';
  // document.getElementById('stopped').className = 'stateButtonInactive';
  // document.getElementById('crawlPrecharge').className = 'stateButtonInactive';
  // document.getElementById('crawl').className = 'stateButtonInactive';
  // document.getElementById('nonRunFault').className = 'stateButtonInactive';
  // document.getElementById('runFault').className = 'stateButtonInactive';
  // document.getElementById('safeToApproach').className = 'stateButtonInactive';
}

/**
 * Sets a state button as active
 * @param {String} state ID of state button to set
 * @static
 */
function setIndicator(state) {
  resetAllButtons();
  // document.getElementById(state).className = 'stateButton';
}

module.exports.setIndicator = setIndicator;

/**
 * Transitions the dashboard to a new state
 * @param {State} state - String of state to transition to
 * @param {Number} state - Number of state to transition to
 */
module.exports.switchState = function switchState(state) {
  console.log(state);
  if (STATE_TIMER.process !== false) {
    STATE_TIMER.stop();
    STATE_TIMER.reset();
  } else {
    STATE_TIMER.start();
  }
  if (state === undefined) {
    console.error('Undefined State');
  } else {
    // setIndicator(targetState);
    if (state === 'crawlPrecharge') state = 'stopped'; // Super jank, fix later
    console.log(state.shortname);
    fillAllBounds(state.shortname);
  }
};

/**
 * Transitions the dashboard to a fault state
 * @param {Number} faultNum The number of the fault
 */
module.exports.setFault = function setFault(faultNum) {
  let faultStr = getStateName(faultNum);
  // console.error(`Entering a ${faultStr}`);
  setIndicator(faultStr);
};

// Dynamic Dropdowns


// code that actually creates the element with the passed in information from fillAllItems
/**
 * Creates an element and appends it to the dropdown
 * @param {String} name The name of the sensor
 * @param {String} group The group it belongs to
 * @param {String} units The unit the sensor reports in
 * @param {String} system the system the sensor belongs to
 */
function createItem(name, dropdown, units, system) { // eslint-disable-line no-unused-vars
  let fixedUnits = ` (${units})`; // Adds parenthesis to the units string
  let fixedName = name.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2') + fixedUnits; // Splits the camel case into two words and adds the units
  fixedName = fixedName.charAt(0).toUpperCase() + fixedName.slice(1); // Capitalizes first letter

  let header = document.createElement('a'); // Creates the actual DOM element
  header.href = ''; // Sets the class
  switch (dropdown) {
    case 'myDropdown1':
      header.onclick = function onclick() { // sets the onclick value
        clone(name);
        return false;
      };
      break;
    case 'myDropdown2':
      header.onclick = function onclick() { // sets the onclick value
        startChart(0, name, fixedName, system, fixedUnits);
        return false;
      };
      break;
    case 'myDropdown3':
      header.onclick = function onclick() { // sets the onclick value
        startChart(1, name, fixedName, system, fixedUnits);
        return false;
      };
      break;
    default:
      break;
  }
  header.innerHTML = `${fixedName}`; // Sets value in the box
  let list = document.getElementById(dropdown);
  list.appendChild(header);
}

/**
 * Creates an element for each sensor and appends it to the dropdown
 * @param {Boolean} testing true if testing false if not
 */
module.exports.fillAllItems = function fillAllItems(testing) { // eslint-disable-line
  let subsystems = Object.keys(DATABASE); // Create array of each subsystem
  subsystems.forEach((subsystem) => {
    let currentSystem = DATABASE[subsystem];
    sensors = Object.keys(currentSystem); // Create an array with all sensors in the subsystem

    sensors.forEach((sensor) => {
      if (!testing) createItem(`${sensor}`, 'myDropdown1', `${currentSystem[sensor].units}`); // For each sensor create an element
      createItem(`${sensor}`, 'myDropdown2', `${currentSystem[sensor].units}`, subsystem); // For each sensor create an element
      createItem(`${sensor}`, 'myDropdown3', `${currentSystem[sensor].units}`, subsystem); // For each sensor create an element
    });
  });
};

module.exports.stateTimer = STATE_TIMER;
