/*
Author: Eric Udlis, Luke Houge
Purpose: Handles all responsive UI elements of the dashboard
*/

const { remote } = require('electron');

const electronWindow = remote.getCurrentWindow();
const config = require('./public/javascripts/config');
const consts = require('./public/javascripts/config').constants;

const RATE = consts.DATA_SEND_RATE;

/*
Modals
Purpose: code for opening a pop up modal box
*/
let modal = document.querySelector('.modal');
let trigger = document.querySelector('.trigger');
let closeButton = document.querySelector('.close-button');

function toggleModal() {
  modal.classList.toggle('show-modal');
  fillConstants(); // eslint-disable-line no-use-before-define
}

function windowOnClick(event) {
  if (event.target === modal) {
    toggleModal();
  }
}

trigger.addEventListener('click', toggleModal);
closeButton.addEventListener('click', toggleModal);
window.addEventListener('click', windowOnClick);

/*
Focus Clone
Purpose: Fill boxes at the top with live information from tables, for better visibility
*/
// Counters for Focus Header
let focusOne;
let focusTwo;
let focusThree;
let focusFour;

const settingsSubmit = document.getElementById('podSettingsSubmit');
const focusClear = document.getElementById('focus_clear_button');

// filling for focus clone
let x = 1; // counter for boxes filed so far
function clone(id) { // eslint-disable-line no-unused-vars
  if (x === 1) {
    // clone for box 1
    focusOne = setInterval(() => {
      const value = Number(document.getElementById(id).innerHTML); // gets value from table
      const fixedValue = value.toFixed(3);
      document.getElementById('header_value_1').innerHTML = fixedValue; // sets the value tp the box
      let name = id.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2'); // changes the ID from camel case to regular
      name = name.charAt(0).toUpperCase() + name.slice(1); // Capitalizes first letter
      document.getElementById('header_label_1').innerHTML = name; // sets that as the label for the box
    }, RATE); // updates every 300 ms
    x += 1;
  } else if (x === 2) {
    // clone for box 2
    focusTwo = setInterval(() => {
      const value = Number(document.getElementById(id).innerHTML);
      const fixedValue = value.toFixed(3);
      document.getElementById('header_value_2').innerHTML = fixedValue;
      let name = id.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2'); // changes the ID from camel case to regular
      name = name.charAt(0).toUpperCase() + name.slice(1); // Capitalizes first letter
      document.getElementById('header_label_2').innerHTML = name;
    }, RATE);
    x += 1;
  } else if (x === 3) {
    // clone for box 3
    focusThree = setInterval(() => {
      const value = Number(document.getElementById(id).innerHTML);
      const fixedValue = value.toFixed(3);
      document.getElementById('header_value_3').innerHTML = fixedValue;
      let name = id.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2'); // changes the ID from camel case to regular
      name = name.charAt(0).toUpperCase() + name.slice(1); // Capitalizes first letter
      document.getElementById('header_label_3').innerHTML = name;
    }, RATE);
    x += 1;
  } else if (x === 4) {
    // clone for box 4
    focusFour = setInterval(() => {
      const value = Number(document.getElementById(id).innerHTML);
      const fixedValue = value.toFixed(3);
      document.getElementById('header_value_4').innerHTML = fixedValue;
      let name = id.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2'); // changes the ID from camel case to regular
      name = name.charAt(0).toUpperCase() + name.slice(1); // Capitalizes first letter
      document.getElementById('header_label_4').innerHTML = name;
    }, RATE);
    x += 1;
  } else if (x > 4) {
    alert('Max of 4 values reached, please remove one and try again');
  }
}
// clear for focus div
function clear() { // eslint-disable-line no-unused-vars
  for (let i = 1; i < 5; i += 1) {
    clearInterval(focusOne);
    clearInterval(focusTwo);
    clearInterval(focusThree);
    clearInterval(focusFour);
    document.getElementById(`header_value_${String(i)}`).innerHTML = '';
    document.getElementById(
      `header_label_${String(i)}`,
    ).innerHTML = `Value ${String(i)}`;
  }
  x = 1;
}

if (focusClear) focusClear.addEventListener('click', clear); // In if statement for testing tool fix

/*
Tables
Purpose: Dynamically styles cells and table based on values in range or not
*/
const tableIDs = ['motion', 'braking', 'battery', 'motor']; // arrays for loop to iterate through
const divIDs = ['motion_div', 'braking_div', 'battery_pack_div', 'motor_div'];

setInterval(() => {
  let errorChecker = 0;
  for (let u = 0; u < 4; u += 1) {
    const table = document.getElementById(tableIDs[u]); // Calls table from array
    for (let r = 1, n = table.rows.length; r < n; r += 1) { // iterates through rows in given table
      const min = parseFloat(table.rows[r].cells[1].innerHTML);
      const max = parseFloat(table.rows[r].cells[3].innerHTML);
      const y = parseFloat(table.rows[r].cells[2].innerHTML);
      if (y < min || y > max) { // checks if too low
        table.rows[r].cells[2].style.backgroundColor = '#FC6962';
        errorChecker += 1; // adds to w, signifying that there is an error present in the table
      } else {
        table.rows[r].cells[2].style.backgroundColor = '#fff'; // else sets to white background
      }
    }
    if (errorChecker !== 0) { // if there was an error in any row during one run of the for loop,
      // meaning errorChecker is not 0 as it was created as,
      // then change the class of the div that tavble is in to 'error',
      // which will make the border color red
      document.getElementById(divIDs[u]).className = 'error';
      errorChecker = 0;
    } else { // if there was not an error during the for loop in any row,
      // then keep the class of the div as 'ok'
      document.getElementById(divIDs[u]).className = 'ok';
      errorChecker = 0;
    }
  }
}, RATE);


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

// search filter function for dropdowns
function filterFunction(id) { // eslint-disable-line no-unused-vars
  // determines which dropdown (1,2, or 3) is being called
  const inputnum = String(`dropdownInput${id}`);
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

/*
Settings form
Purpose: Read and Write to Config File
*/

// Submits Entries to File
settingsSubmit.addEventListener('click', () => {
  let constsCache = {
    dataSendRate: null,
    serverAddr: {
      ip: null,
      port: null,
    },
    hvBone: {
      ip: null,
      port: null,
    },
    lvBone: {
      ip: null,
      port: null,
    },
  };
  constsCache.serverAddr.ip = document.getElementById('podIP').value;
  constsCache.serverAddr.port = Number(document.getElementById('podPort').value);
  constsCache.dataSendRate = Number(document.getElementById('scanningRate').value);
  constsCache.hvBone.ip = document.getElementById('hvBoneIP').value;
  constsCache.hvBone.port = Number(document.getElementById('hvBonePort').value);
  constsCache.lvBone.ip = document.getElementById('lvBoneIP').value;
  constsCache.lvBone.port = Number(document.getElementById('lvBonePort').value);
  document.getElementById('formFeedback').innerHTML = config.writeJSON(constsCache);
});

// Fills entries in text boxes
function fillConstants() { // eslint-disable-line no-unused-vars
  config.updateConstants();
  document.getElementById('formFeedback').innerHTML = '';
  document.getElementById('podIP').value = String(consts.serverAddr.ip);
  document.getElementById('podPort').value = consts.serverAddr.port;
  document.getElementById('scanningRate').value = consts.dataSendRate;
  document.getElementById('lvBoneIP').value = consts.lvBone.ip;
  document.getElementById('lvBonePort').value = consts.lvBone.port;
  document.getElementById('hvBoneIP').value = consts.hvBone.ip;
  document.getElementById('hvBonePort').value = consts.hvBone.port;
}

// Window Handling
document.getElementById('min-window').addEventListener('click', () => {
  electronWindow.minimize();
});

document.getElementById('max-window').addEventListener('click', () => {
  if (!electronWindow.isMaximized()) electronWindow.maximize();
  else electronWindow.unmaximize();
});

document.getElementById('close-window').addEventListener('click', () => {
  electronWindow.close();
});

/*
Tabs view
Purpose: Tabs for multiple views in the settings modal
*/
function tabs(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}
