/*
Author: Eric Udlis, Luke Houge
Purpose: Dynamically fill the dashboard with content based off database.JSON
*/
const database = require('../../database.json');
const di = require('./datainterfacing');
const Timer = require('./Timer');

const stateTimer = new Timer();

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
  let renderable = di.findRenderable();
  let col = document.createElement('td'); // Creates Element
  col.className = 'min'; // Assigns class
  col.id = `${name}Min`; // Assigns ID
  // Fills box with correct value
  col.innerHTML = String(renderable[group][name].limits.powerOff.min);
  return col;
}

function createActualCol(name) {
  let col = document.createElement('td');
  col.className = 'actual';
  col.id = `${name}`;
  return col;
}
function createMaxCol(name, group) {
  let renderable = di.findRenderable();
  let col = document.createElement('td');
  col.className = 'max';
  col.id = `${name}Max`;
  col.innerHTML = `${renderable[group][name].limits.powerOff.max}`;
  return col;
}

// Uses above functions to create a row
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

// Uses above functions to fill a table with rows
function fillTable(table) { // eslint-disable-line
  let renderable = di.findRenderable();
  let currentSystem = renderable[table];
  sensors = Object.keys(currentSystem); // Create an array with all sensors in the subsystem

  sensors.forEach((sensor) => {
    createRow(`${sensor}`, table, `${currentSystem[sensor].units}`); // For each sensor create a row
  });
}

// Uses fillTable to fill every table
module.exports.fillAllTables = function fillAllTables() { // eslint-disable-line
  let renderable = di.findRenderable();
  let subsystems = Object.keys(renderable); // Create array of each subsystem
  subsystems.forEach((subsystem) => {
    fillTable(`${subsystem}`); // For each subsystem create a table
  });
  console.log('Sucessfully Initiated Tables');
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
  let renderable = di.findRenderable();
  let stored = renderable[subsystem][sensor].limits[state];
  setMinCell(sensor, stored.min);
  setMaxCell(sensor, stored.max);
}

function fillTableBounds(subsystem, state) {
  let renderable = di.findRenderable();
  sensors = Object.keys(renderable[subsystem]);
  sensors.forEach((sensor) => {
    // console.log(`Starting ${sensor}`);
    fillRowBounds(subsystem, sensor, state);
    // console.log(`Finised ${sensor}`);
  });
}

function fillAllBounds(state) { // eslint-disable-line no-unused-vars
  let renderable = di.findRenderable();
  subsystems = Object.keys(renderable);
  subsystems.forEach((system) => {
    // console.log(`Starting ${system}`);
    fillTableBounds(system, state);
    // console.log(`Finised ${system}`);
  });
}

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

function resetAllButtons() {
  document.getElementById('powerOff').className = 'stateButtonInactive';
  document.getElementById('idle').className = 'stateButtonInactive';
  document.getElementById('postRun').className = 'stateButtonInactive';
  document.getElementById('pumpdown').className = 'stateButtonInactive';
  document.getElementById('propulsion').className = 'stateButtonInactive';
  document.getElementById('braking').className = 'stateButtonInactive';
  document.getElementById('stopped').className = 'stateButtonInactive';
  document.getElementById('crawlPrecharge').className = 'stateButtonInactive';
  document.getElementById('crawl').className = 'stateButtonInactive';
  document.getElementById('nonRunFault').className = 'stateButtonInactive';
  document.getElementById('runFault').className = 'stateButtonInactive';
  document.getElementById('brakingFault').className = 'stateButtonInactive';
  document.getElementById('safeToApproach').className = 'stateButtonInactive';
}

function setIndicator(state) {
  resetAllButtons();
  document.getElementById(state).className = 'stateButton';
}

module.exports.setIndicator = setIndicator;

module.exports.switchState = function switchState(state) {
  let type = typeof state;
  let targetState = state;
  if (stateTimer.process !== false) {
    stateTimer.stop();
    stateTimer.reset();
  } else {
    stateTimer.start();
  }
  if (type === 'number') targetState = getStateName(state);
  if (targetState === undefined) {
    console.error('Undefined State');
  } else {
    setIndicator(targetState);
    if (targetState === 'crawlPrecharge') targetState = 'stopped'; // Super jank, fix later
    fillAllBounds(targetState);
  }
};
module.exports.setFault = function setFault(faultNum) {
  let faultStr = getStateName(faultNum);
  // console.error(`Entering a ${faultStr}`);
  setIndicator(faultStr);
};

// Dynamic Dropdowns


// code that actually creates the element with the passed in information from fillAllItems
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

//
module.exports.fillAllItems = function fillAllItems(testing) { // eslint-disable-line
  let subsystems = Object.keys(database); // Create array of each subsystem
  subsystems.forEach((subsystem) => {
    let currentSystem = database[subsystem];
    sensors = Object.keys(currentSystem); // Create an array with all sensors in the subsystem

    sensors.forEach((sensor) => {
      if (!testing) createItem(`${sensor}`, 'myDropdown1', `${currentSystem[sensor].units}`); // For each sensor create an element
      createItem(`${sensor}`, 'myDropdown2', `${currentSystem[sensor].units}`, subsystem); // For each sensor create an element
      createItem(`${sensor}`, 'myDropdown3', `${currentSystem[sensor].units}`, subsystem); // For each sensor create an element
    });
  });
};

module.exports.stateTimer = stateTimer;
