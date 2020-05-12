const Button = require('./Button');

const CONTROL_PANEL_BUTTONS = [];
/**
 * Class representing a control panel button
 * @extends Button
 */
class ControlPanelButton extends Button {
  /**
   * Creates a control panel button
   * @param {String} name Button shortname
   * @param {String} text Button text
   * @param {HTMLElement} parent Button parent
   * @param {String} bgColor Button background color
   * @param {Boolean} hazard If the action this button triggers is hazardous
   */
  constructor(name, text, parent, bgColor, hazard) {
    super(name, text, parent, bgColor, 'white', hazard);
    this.active = false;
    if (!hazard) this.domElement.style.border = '2px solid black';
    CONTROL_PANEL_BUTTONS.push(this);
  }

  /**
   * Sets the parent for all control panel buttons
   * Note the parent must be set before creating any buttons
   * @param {HTMLElement} controlPanel The html element representing the control panel
   */
  static setControlPanel(controlPanel) {
    this.parent = controlPanel;
    CONTROL_PANEL_BUTTONS.forEach((button) => {
      button.setParent(controlPanel);
    });
  }
}
ControlPanelButton.parent = null;

module.exports = ControlPanelButton;
