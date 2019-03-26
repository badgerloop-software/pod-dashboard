const database = require('../../database.json');

console.log(database);


// 
function createItem(name, group, units) { // eslint-disable-line no-unused-vars
    let header = document.createElement('a'); // Creates the actual DOM element
    let fixedUnits = ` (${units})`; // Adds parenthesis to the units string
    let fixedName = name.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2') + fixedUnits; // Splits the camel case into two words and adds the units
    fixedName = fixedName.charAt(0).toUpperCase() + fixedName.slice(1); // Capitalizes first letter
    header.innerHTML = `${fixedName}`; // Sets value in the box
    let table = document.getElementById(group);
    table.appendChild(header);

}

// 
module.exports.fillAllItems = function fillAllItems() { // eslint-disable-line
    let subsystems = Object.keys(database); // Create array of each subsystem
    subsystems.forEach((subsystem) => {
        let currentSystem = database[subsystem];
        sensors = Object.keys(currentSystem); // Create an array with all sensors in the subsystem

        sensors.forEach((sensor) => {
            createItem(`${sensor}`, 'myDropdown1', `${currentSystem[sensor].units}`); // For each sensor create an element
        });
    });
};
