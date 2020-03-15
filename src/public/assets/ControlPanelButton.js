const Button = require('./button');

class ControlPanelButton extends Button {
  constructor(name, text, bgColor, hazard) {
    super(name, text, ControlPanelButton.parent, bgColor, 'white', hazard);
    this.active = false;
    if (!hazard) this.domElement.style.border = '2px solid black';
  }

  static setParent(parent) { // Note the parent must be set before creating any buttons
    ControlPanelButton.parent = parent;
  }

  static getParent() {
    return ControlPanelButton.parent;
  }
}
ControlPanelButton.parent = null;

module.exports = ControlPanelButton;
