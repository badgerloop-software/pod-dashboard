const database = require('./database.json');

function createHeaderCol(name, table, units) {
  let header = document.createElement('td');
  header.className = `valueTable${table}`;
  let fixedName = name.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2') + ` (${units})`;
  fixedName = fixedName.charAt(0).toUpperCase() + fixedName.slice(1);
  header.innerHTML = `${fixedName}`;
  console.log(header);
  return header;
}


function createMinCol(name, group) {
  let col = document.createElement('td');
  col.className = 'min';
  col.id = `${name}Min`;
  col.innerHTML = String(database[group][name].limits.idle.min);
  console.log(col);
  return col;
}

function createActualCol(name) {
  let col = document.createElement('td');
  col.className = 'actual';
  col.id = `${name}`;
  console.log(col);
  return col;
}

function createMaxCol(name, group) {
  let col = document.createElement('td');
  col.className = 'max';
  col.id = `${name}Max`;
  col.innerHTML = `${database[group][name].limits.idle.max}`;
  console.log(col);
  return col;
}

function createRow(name, table, group, units) { // eslint-disable-line no-unused-vars
  let row = document.createElement('tr');

  let header = createHeaderCol(name, table, units);
  row.appendChild(header);

  let min = createMinCol(name, group);
  row.appendChild(min);

  let actual = createActualCol(name);
  row.appendChild(actual);

  let max = createMaxCol(name, group);
  row.appendChild(max);
}
