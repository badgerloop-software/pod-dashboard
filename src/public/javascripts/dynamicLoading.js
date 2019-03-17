const database = require('../../database.json');

function createHeaderCol(name, group, units) {
  let header = document.createElement('td');
  header.className = `valueTable${group}`;
  let fixedUnits = ` (${units})`;
  let fixedName = name.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2') + fixedUnits;
  fixedName = fixedName.charAt(0).toUpperCase() + fixedName.slice(1);
  header.innerHTML = `${fixedName}`;
  return header;
}


function createMinCol(name, group) {
  let col = document.createElement('td');
  col.className = 'min';
  col.id = `${name}Min`;
  col.innerHTML = String(database[group][name].limits.idle.min);
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

function fillTable(table) { // eslint-disable-line
  let currentSystem = database[table];
  sensors = Object.keys(currentSystem);

  sensors.forEach((sensor) => {
    createRow(`${sensor}`, table, `${currentSystem[sensor].units}`);
  });
}

module.exports.fillAllTables = function fillAllTables() { // eslint-disable-line
  let subsystems = Object.keys(database);
  subsystems.forEach((subsystem) => {
    fillTable(`${subsystem}`);
  });
};
