/**
 * @module Main
 * @author Eric Udlis, Luke Houge
 * @description Handles all responsive UI elements of the dashboard
 */

const { remote: REMOTE } = require('electron');

const ELECTRON_WINDOW = REMOTE.getCurrentWindow();
const CONFIG = require('./public/javascripts/config');
const CONFIG_CONSTANTS = require('./public/javascripts/config').constants;

const RATE = CONFIG_CONSTANTS.DATA_SEND_RATE;

/*
Modals
Purpose: code for opening a pop up modal box
*/
const SETTINGS_MODAL = document.querySelector('.settingsModal');
const SETTINGS_TRIGGER = document.getElementById('settingsTrigger');
const CLOSE_BUTTON = document.querySelector('.close-button');

/**
 * Toggles hide/show of the settings modal
 */
function toggleSettingsModal() {
  SETTINGS_MODAL.classList.toggle('show-modal');
  fillConstants(); // eslint-disable-line no-use-before-define
}

if (SETTINGS_TRIGGER) SETTINGS_TRIGGER.addEventListener('click', toggleSettingsModal);
if (CLOSE_BUTTON) CLOSE_BUTTON.addEventListener('click', toggleSettingsModal);

// window.addEventListener('click', windowOnClick);

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


// filling for focus clone
let x = 1; // counter for boxes filed so far
/**
 * Clones the value from a table to the focus header
 * @param {String} id ID of sensor to focus
 */
function clone(id) { // eslint-disable-line no-unused-vars
  if (x === 1) {
    // clone for box 1
    focusOne = setInterval(() => {
      const value = Number(document.getElementById(id).innerHTML); // gets value from table
      // const fixedValue = value.toFixed(3);
      document.getElementById('header_value_1').innerHTML = value; // sets the value tp the box
      let name = id.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2'); // changes the ID from camel case to regular
      name = name.charAt(0).toUpperCase() + name.slice(1); // Capitalizes first letter
      document.getElementById('header_label_1').innerHTML = name; // sets that as the label for the box
    }, RATE); // updates every 300 ms
    x += 1;
  } else if (x === 2) {
    // clone for box 2
    focusTwo = setInterval(() => {
      const value = Number(document.getElementById(id).innerHTML);
      // const value = value.toFixed(3);
      document.getElementById('header_value_2').innerHTML = value;
      let name = id.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2'); // changes the ID from camel case to regular
      name = name.charAt(0).toUpperCase() + name.slice(1); // Capitalizes first letter
      document.getElementById('header_label_2').innerHTML = name;
    }, RATE);
    x += 1;
  } else if (x === 3) {
    // clone for box 3
    focusThree = setInterval(() => {
      const value = Number(document.getElementById(id).innerHTML);
      // const value = value.toFixed(3);
      document.getElementById('header_value_3').innerHTML = value;
      let name = id.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2'); // changes the ID from camel case to regular
      name = name.charAt(0).toUpperCase() + name.slice(1); // Capitalizes first letter
      document.getElementById('header_label_3').innerHTML = name;
    }, RATE);
    x += 1;
  } else if (x === 4) {
    // clone for box 4
    focusFour = setInterval(() => {
      const value = Number(document.getElementById(id).innerHTML);
      // const value = value.toFixed(3);
      document.getElementById('header_value_4').innerHTML = value;
      let name = id.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2'); // changes the ID from camel case to regular
      name = name.charAt(0).toUpperCase() + name.slice(1); // Capitalizes first letter
      document.getElementById('header_label_4').innerHTML = name;
    }, RATE);
    x += 1;
  } else if (x > 4) {
    alert('Max of 4 values reached, please remove one and try again');
  }
}
/**
 * Clears the focus div
 */
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

/*
Tables
*/
const tableIDs = ['motion', 'braking_table', 'battery', 'motor']; // arrays for loop to iterate through
const divIDs = ['motion_div', 'braking_div', 'battery_pack_div', 'motor_div'];
/**
 * Dynamically styles cells and table based on if value is within nominal range
 */
setInterval(() => {
  let errorChecker = 0;
  for (let u = 0; u < 4; u += 1) {
    const table = document.getElementById(tableIDs[u]); // Calls table from array
    for (let r = 1, n = table.rows.length; r < n; r += 1) { // iterates through rows in given table
      const min = parseFloat(table.rows[r].cells[1].innerHTML);
      const max = parseFloat(table.rows[r].cells[3].innerHTML);
      const y = parseFloat(table.rows[r].cells[2].innerHTML);
      if (y < min || y > max || y === 'Off') { // checks if too low
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
/**
 * Takes the value of the table search box and filters table
 * @param {String} tableID The name of the table to search
 */
function searchTable(tableID) { // eslint-disable-line no-unused-vars
  let input; let filter; let table; let tr; let td;
  input = document.getElementById(`${tableID}input`);
  filter = input.value.toUpperCase();
  table = document.getElementById(tableID);
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
Settings form
Purpose: Read and Write to Config File
*/

// Submits Entries to File
if (settingsSubmit) {
  settingsSubmit.addEventListener('click', () => {
    let constsCache = {
      dataSendRate: null,
      renderInterval: null,
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
    constsCache.renderInterval = Number(document.getElementById('renderInterval').value);
    document.getElementById('formFeedback').innerHTML = CONFIG.writeJSON(constsCache);
    ELECTRON_WINDOW.reload();
  });
}

/**
 * Fills constants in settings modal
 */
function fillConstants() { // eslint-disable-line no-unused-vars
  CONFIG.updateConstants();
  document.getElementById('formFeedback').innerHTML = 'Will restart for changes to take place.';
  document.getElementById('podIP').value = String(CONFIG_CONSTANTS.serverAddr.ip);
  document.getElementById('podPort').value = CONFIG_CONSTANTS.serverAddr.port;
  document.getElementById('scanningRate').value = CONFIG_CONSTANTS.dataSendRate;
  document.getElementById('lvBoneIP').value = CONFIG_CONSTANTS.lvBone.ip;
  document.getElementById('lvBonePort').value = CONFIG_CONSTANTS.lvBone.port;
  document.getElementById('hvBoneIP').value = CONFIG_CONSTANTS.hvBone.ip;
  document.getElementById('hvBonePort').value = CONFIG_CONSTANTS.hvBone.port;
  document.getElementById('renderInterval').value = CONFIG_CONSTANTS.renderInterval;
}

// Window Handling

document.getElementById('min-window').addEventListener('click', () => {
  ELECTRON_WINDOW.minimize();
});

document.getElementById('max-window').addEventListener('click', () => {
  if (!ELECTRON_WINDOW.isMaximized()) ELECTRON_WINDOW.maximize();
  else ELECTRON_WINDOW.unmaximize();
});

document.getElementById('close-window').addEventListener('click', () => {
  ELECTRON_WINDOW.close();
});

const FOCUS_DROPDOWN = new Dropdown('focusAddButton', 'Add Values', document.getElementById('focusBox'), true, clone); // eslint-disable-line
const FOCUS_CLEAR = new Dropdown('focusClear', 'Clear', document.getElementById('focusBox'), false);
FOCUS_CLEAR.onClick(clear);


/**
 * Since Luke said this was impossible and could not be done, I had to do this myself
 * As you can see, it is possible, not fun, not quick, but possible.
 * This allows dropdowns to dissapear whenever you click out of them
 * Never let anything hold you back, set your mind to whatever you want and you will achieve it
 * ~ Eric Udlis 03/25/2020
 */
document.body.addEventListener('click', (e) => {
  let isADropdown = false;
  if (e.target.classList.contains('dropdown-content') || e.target.parentNode.classList.contains('dropdown-content')) isADropdown = true;
  if (e.target.classList.contains('dropbtn') || e.target.parentNode.classList.contains('dropbtn')) isADropdown = true;
  if (!isADropdown) {
    Dropdown.getListOfDropdowns().forEach((dropdown) => {
      if (dropdown.list) dropdown.list.classList.remove('show');
    });
  }
});
