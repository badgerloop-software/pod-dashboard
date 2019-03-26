/*
Author: Luke Houge
Purpose: Dynamically fill dropdowns with content based off database.JSON
*/

const database = require('../../database.json');

console.log(database);


// code that actually createsnpm the element with the passed in information from fillAllItems
function createItem(name, group, units) { // eslint-disable-line no-unused-vars
    let fixedUnits = ` (${units})`; // Adds parenthesis to the units string
    let fixedName = name.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2') + fixedUnits; // Splits the camel case into two words and adds the units
    fixedName = fixedName.charAt(0).toUpperCase() + fixedName.slice(1); // Capitalizes first letter

    let header = document.createElement('a'); // Creates the actual DOM element
    header.href = ""; // Sets the class
    switch (group) {
        case 'myDropdown1':
            header.onclick = function () { //sets the onclick value
                clone('stoppingDistance');
                return false;
            };
            break;
        case 'myDropdown2':
            header.onclick = function () { //sets the onclick value
                generateLineChartOne(name, fixedName);
                return false;
            };
            break;
        case 'myDropdown3':
            header.onclick = function () { //sets the onclick value
                generateLineChartTwo(name, fixedName); 
                return false;
            };
            break;
    }
    header.innerHTML = `${fixedName}`; // Sets value in the box
    let list = document.getElementById(group);
    list.appendChild(header);

}

// 
module.exports.fillAllItems = function fillAllItems() { // eslint-disable-line
    let subsystems = Object.keys(database); // Create array of each subsystem
    subsystems.forEach((subsystem) => {
        let currentSystem = database[subsystem];
        sensors = Object.keys(currentSystem); // Create an array with all sensors in the subsystem

        sensors.forEach((sensor) => {
            createItem(`${sensor}`, 'myDropdown1', `${currentSystem[sensor].units}`); // For each sensor create an element
            createItem(`${sensor}`, 'myDropdown2', `${currentSystem[sensor].units}`); // For each sensor create an element
            createItem(`${sensor}`, 'myDropdown3', `${currentSystem[sensor].units}`); // For each sensor create an element
        });
    });
};

