const DATABASE = require('../../database.json');

let nextID = 0;
const DROPDOWNS = [];
module.exports = class Dropdown {
  /**
   * Creates a dropdown button
   * @param {String} name The shortname of the button
   * @param {String} text The button text
   * @param {HTMLElement} parent The html parent of the button
   * @param {Boolean} containsList If this dropdown has a list of sensors
   * @param {Function} listOnClick The function the list element will execute on click
   */
  constructor(name, text, parent, containsList, listOnClick, chartIndex) {
    this.name = name;
    this.text = text;
    this.parent = parent;
    this.id = nextID++;
    this.containsList = containsList;
    this.chartIndex = chartIndex;
    this.btn = this.createDropdownBtn();
    this.parent.appendChild(this.btn);
    if (this.containsList) {
      this.listOnClick = listOnClick;
      this.list = Dropdown.createDropdown(this.id);
     this.parent.appendChild(this.btn);
     this.parent.appendChild(this.list);
      this.fillList();
      this.onClick(() => {
        this.toggle();
      });
    }
    
    DROPDOWNS.push(this);
  }

  /**
   * Creates the DOM button for the dropdown
   */
  createDropdownBtn() {
    let btn = document.createElement('button');
    btn.className = 'dropbtn';
    btn.id = this.name;
    let txt = document.createElement('h5');
    txt.innerHTML = this.text;
    btn.appendChild(txt);
    return btn;
  }

  /**
   * For dropdowns without a list this is the function that will execute on click
   * @param {Function} fcn The function to execute on click
   */
  onClick(fcn) {
    this.btn.addEventListener('click', () => {
      fcn();
    });
  }

  /**
   * Toggles the dropdown list from showing/hiding
   */
  toggle() {
    this.list.classList.toggle('show');
  }

  /**
   * Fills the dropdown list with items for each sensor
   */
  fillList() {
    let subsystems = Object.keys(DATABASE); // Create array of each subsystem
    subsystems.forEach((subsystem) => {
      let currentSystem = DATABASE[subsystem];
      let sensors = Object.keys(currentSystem); // Create an array with all sensors in the subsystem
      sensors.forEach((sensor) => {
        this.createItem(`${sensor}`, `${currentSystem[sensor].units}`, subsystem); // For each sensor create an element
      });
    });
  }

  /**
   * Creates a sensor item and appends it to the dropdown
   * @param {String} name Name of the sensor
   * @param {String} units Units the sensor is displayed in
   * @param {String} system The subsystem the sensor is in
   */
  createItem(name, units, system) { // eslint-disable-line no-unused-vars
    let fixedUnits = ` (${units})`; // Adds parenthesis to the units string
    let fixedName = name.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2') + fixedUnits; // Splits the camel case into two words and adds the units
    fixedName = fixedName.charAt(0).toUpperCase() + fixedName.slice(1); // Capitalizes first letter

    let header = document.createElement('a'); // Creates the actual DOM element
    header.onclick = () => {
      this.listOnClick(name, fixedName, units, system, fixedUnits, this.chartIndex);
    };
    header.innerHTML = `${fixedName}`; // Sets value in the box
    this.list.appendChild(header);
  }

  /**
   * Filters the results of a dropdown based on user input
   * @param {Number} num The dropdown number to filter
   */
  static filterSearch(num) {
    const inputnum = String(`dropdownInput${num}`);
    let i;
    const input = document.getElementById(inputnum);
    const filter = input.value.toUpperCase();
    const div = document.getElementById(`myDropdown${String(num)}`);
    const a = div.getElementsByTagName('a');
    for (i = 0; i < a.length; i += 1) {
      if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = '';
      } else {
        a[i].style.display = 'none';
      }
    }
  }

  /**
   * Creates the dropdown list
   * @param {Number} id The dropdown number to create
   * @returns {HTMLElement} The dropdown list
   */
  static createDropdown(id) {
    let div = document.createElement('div');
    div.id = `myDropdown${id}`;
    div.className = 'dropdown-content';
    let search = document.createElement('input');
    search.setAttribute('type', 'text');
    search.setAttribute('placeholder', 'Search...');
    search.id = `dropdownInput${id}`;
    search.setAttribute('onkeyup', `Dropdown.filterSearch(${id})`);
    div.appendChild(search);
    return div;
  }

  /**
   * Returns a list of all current dropdowns
   * @returns {Dropdown[]} List of all dropdowns
   */
  static getListOfDropdowns() {
    return DROPDOWNS;
  }
};
