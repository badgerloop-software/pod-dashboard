const DATABASE = require('../../database.json');

let nextID = 0;
module.exports = class Dropdown {
  constructor(name, text, parent, containsList) {
    this.name = name;
    this.text = text;
    this.parent = parent;
    this.id = nextID++;
    this.containsList = containsList;
    this.btn = this.createDropdownBtn();
    this.parent.appendChild(this.btn);
    if (this.containsList) {
      this.list = Dropdown.createDropdown(this.id);
      parent.appendChild(this.list);
      this.fillList();
      this.onClick(() => {
        this.toggle();
      });
    }
  }

  createDropdownBtn() {
    let btn = document.createElement('button');
    btn.className = 'dropbtn';
    btn.id = this.name;
    let txt = document.createElement('h5');
    txt.innerHTML = this.text;
    btn.appendChild(txt);
    return btn;
  }

  onClick(fcn) {
    this.btn.addEventListener('click', () => {
      fcn();
    });
  }

  toggle() {
    this.list.classList.toggle('show');
  }

  fillList() {
    let subsystems = Object.keys(DATABASE); // Create array of each subsystem
    subsystems.forEach((subsystem) => {
      let currentSystem = DATABASE[subsystem];
      let sensors = Object.keys(currentSystem); // Create an array with all sensors in the subsystem
      sensors.forEach((sensor) => {
        this.createItem(`${sensor}`, `myDropdown${this.id}`, `${currentSystem[sensor].units}`); // For each sensor create an element
      });
    });
  }

  /*
  * Creates an element and appends it to the dropdown
  * @param {String} name The name of the sensor
  * @param {String} group The group it belongs to
  * @param {String} units The unit the sensor reports in
  * @param {String} system the system the sensor belongs to
  */
  createItem(name, dropdown, units, system) { // eslint-disable-line no-unused-vars
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
    this.list.appendChild(header);
  }

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
};
