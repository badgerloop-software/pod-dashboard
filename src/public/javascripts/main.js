/*
Author: Eric Udlis, Luke Houge
Purpose: Handles all responsive UI elements of the dashboard
*/
const consts = require('./constants');

const settingsSubmit = document.getElementById('podSettingsSubmit');

let x = 1; // counter for boxes filed so far
function clone(id) { // eslint-disable-line no-unused-vars
  if (x === 1) {
    // clone for box 1
    setInterval(() => {
      const value = document.getElementById(id).innerHTML; // gets value from table
      document.getElementById('header_value_1').innerHTML = value; // sets the value tp the box
      const name = id.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2'); // changes the ID from camel case to regular
      document.getElementById('header_label_1').innerHTML = name; // sets that as the label for the box
    }, 300); // updates every 300 ms
    x += 1;
  } else if (x === 2) {
    // clone for box 2
    setInterval(() => {
      const value = document.getElementById(id).innerHTML;
      document.getElementById('header_value_2').innerHTML = value;
      const name = id.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2');
      document.getElementById('header_label_2').innerHTML = name;
    }, 300);
    x += 1;
  } else if (x === 3) {
    // clone for box 3
    setInterval(() => {
      const value = document.getElementById(id).innerHTML;
      document.getElementById('header_value_3').innerHTML = value;
      const name = id.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2');
      document.getElementById('header_label_3').innerHTML = name;
    }, 300);
    x += 1;
  } else if (x === 4) {
    // clone for box 4
    setInterval(() => {
      const value = document.getElementById(id).innerHTML;
      document.getElementById('header_value_4').innerHTML = value;
      const name = id.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2');
      document.getElementById('header_label_4').innerHTML = name;
    }, 300);
    x += 1;
  } else if (x > 4) {
    alert('Max of 4 values reached, please remove one and try again');
  }
}

// clear for focus div (not working)
function clear() { // eslint-disable-line no-unused-vars
  for (let i = 1; i < 5; i += 1) {
    document.getElementById(`header_value_${String(i)}`).innerHTML = '';
    document.getElementById(
      `header_label_${String(i)}`,
    ).innerHTML = `Value ${String(i)}`;
  }
}

/*
Tables
Purpose: Dynamically styles cells and table based on values in range or not
*/
const tableIDs = ['motion', 'braking', 'battery', 'motor']; // arrays for loop to iterate through
const divIDs = ['motion_div', 'braking_div', 'battery_pack_div', 'motor_div'];
const statusIDs = ['motion_status', 'braking_status', 'battery_status', 'motor_status'];

// random generator for motion
setInterval(() => {
  let y;
  let w = 0;
  for (let v = 1; v < 6; v += 1) { // for loop that goes through each row of the table,
    // 'i' being used to represent row (should probably change to r)
    const cells = document.getElementById('motion').rows[v].cells; // eslint-disable-line
    // sets a variable y to the value that is currently in the 3rd colunn (the value column)
    if (y < 2) { // if that obtained value is less than 2 (arbitrary number for now),
      // style red and add to counter w which will be used to determine if any row had an error
      cells[2].style.backgroundColor = '#FC6962';
      w += 1;
    } else if (y > 90) { // if that obtained value is greater
      // than 90 (arbitrary value for now), style green
      cells[2].style.backgroundColor = '#C8EEC4';
    } else { // if it is in between remain, or change back, to white background
      cells[2].style.backgroundColor = '#fff';
    }
  }
  if (w !== 0) { // if there was an error in any row during one run of the for loop,
    // meaning w is not 0 as it was created as,
    // then change the class of the div that tavble is in to 'error',
    // which will make the border color red
    document.getElementById('motion_div').className = 'error';
    w = 0;
  } else { // if there was not an error during the for loop in any row,
    // then keep the class of the div as 'ok'
    document.getElementById('motion_div').className = 'ok';
    w = 0;
  }
}, 300);

// random generator for braking and pressures
setInterval(() => {
  let y;
  let w = 0;
  for (let t = 1; t < 9; t += 1) {
    const cells = document.getElementById('braking').rows[t].cells; // eslint-disable-line
    if (y < 2) {
      cells[2].style.backgroundColor = '#FC6962';
      w += 1;
    } else if (y > 90) {
      cells[2].style.backgroundColor = '#C8EEC4';
    } else {
      cells[2].style.backgroundColor = '#fff';
    }
  }
  if (w !== 0) {
    document.getElementById('braking_div').className = 'error';
    w = 0;
  } else {
    document.getElementById('braking_div').className = 'ok';
    w = 0;
  }
}, 300);

setInterval(() => {
  let w = 0;
  for (let u = 0; u < 3; u += 1) {
    const table = document.getElementById(tableIDs[u]); // creates table array
    for (let r = 1, n = table.rows.length; r < n; r += 1) { // iterates through rows in given table
      const min = parseInt(table.rows[r].cells[1].innerHTML, 10); // sets the min value to min
      const y = parseInt(table.rows[r].cells[2].innerHTML, 10); // sets the value to y
      if (y < min) { // checks if too low
        table.rows[r].cells[2].style.backgroundColor = '#FC6962'; // makes red
        w += 1; // adds to w, signifying that there is an error present in the table
      } else {
        table.rows[r].cells[2].style.backgroundColor = '#fff'; // else sets to white background
      }
    }
    if (w !== 0) { // if there was an error in any row during one run of the for loop,
      // meaning w is not 0 as it was created as,
      // then change the class of the div that tavble is in to 'error',
      // which will make the border color red
      document.getElementById(divIDs[u]).className = 'error';
      w = 0;
    } else { // if there was not an error during the for loop in any row,
      // then keep the class of the div as 'ok'
      document.getElementById(divIDs[u]).className = 'ok';
      w = 0;
    }
    // dummy function for status, 2-10= connected, 1= disconected
    const c = 2;
    if (c > 1) {
      document.getElementById(statusIDs[u]).className = 'connected';
    }
    if (c === 1) {
      document.getElementById(statusIDs[u]).className = 'disconnected';
    }
  }
}, 100);


// Table Search Boxes
function searchTable(range) { // eslint-disable-line no-unused-vars
  let input; let filter; let table; let tr; let td;
  input = document.getElementById(`${range}input`);
  filter = input.value.toUpperCase();
  table = document.getElementById(range);
  tr = table.getElementsByTagName('tr');
  for (let i = 0; i < tr.length; i += 1) {
    td = tr[i].getElementsByTagName('td')[0];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) tr[i].style.display = '';
      else tr[i].style.display = 'none';
    }
  }
}

/*
Dropdowns
Purpose: Enable dynamic and searchable dropdowns
*/

// determines which dropdown is being triggered
function dropdown(num) { // eslint-disable-line no-unused-vars
  document.getElementById(`myDropdown${String(num)}`).classList.toggle('show');
}

// search filter function for  dropdowns
function filterFunction(id) { // eslint-disable-line no-unused-vars
  // determines which dropdown (1,2, or 3) is being called
  const inputnum = String(`dropdownInput${id}`);

  // filter function
  let i;
  const input = document.getElementById(inputnum);
  const filter = input.value.toUpperCase();
  const div = document.getElementById(`myDropdown${String(id)}`);
  const a = div.getElementsByTagName('a');
  for (i = 0; i < a.length; i += 1) {
    if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = '';
    } else {
      a[i].style.display = 'none';
    }
  }
}

// Settings Form

// Submits Entries to File
settingsSubmit.addEventListener('click', () => {
  consts.serverAddr.ip = document.getElementById('podIP').value;
  consts.serverAddr.port = Number(document.getElementById('podPort').value);
  consts.databaseAddr.ip = document.getElementById('databaseIP').value;
  consts.databaseAddr.port = Number(document.getElementById('databasePort').value);
  consts.scanningRate = Number(document.getElementById('scanningRate').value);
  document.getElementById('formFeedback').innerHTML = 'Settings Applied';
});

// Fills entries in text boxes
function fillConstants() { // eslint-disable-line no-unused-vars
  document.getElementById('formFeedback').innerHTML = '';
  document.getElementById('podIP').value = String(consts.serverAddr.ip);
  document.getElementById('podPort').value = consts.serverAddr.port;
  document.getElementById('databaseIP').value = consts.databaseAddr.ip;
  document.getElementById('databasePort').value = consts.databaseAddr.port;
  document.getElementById('scanningRate').value = consts.scanningRate;
}
