const Button = require('./button');
/**
 * Class representing a control panel button
 * @extends Button
 */
class ControlPanelButton extends Button {
  /**
   * Creates a control panel button
   * @param {String} name Button shortname
   * @param {String} text Button text
   * @param {String} bgColor Button background color
   * @param {Boolean} hazard If the action this button triggers is hazardus
   */
  constructor(name, text, bgColor, hazard) {
    super(name, text, ControlPanelButton.parent, bgColor, 'white', hazard);
    this.active = false;
    if (!hazard) this.domElement.style.border = '2px solid black';
  }

  /**
   * Sets the parent for all control panel buttons
   * Note the parent must be set before creating any buttons
   * @param {HTMLElement} parent The html element representing the control panel
   */
  static setParent(parent) { // Note the parent must be set before creating any buttons
    ControlPanelButton.parent = parent;
  }

  /**
   * Gets the parent for the control panel buttons
   * @returns {HTMLElement} The control panel HTMLElement
   */
  static getParent() {
    return ControlPanelButton.parent;
  }
}
ControlPanelButton.parent = null;

module.exports = ControlPanelButton;
