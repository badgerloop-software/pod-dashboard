const Button = require('./Button');
/**
 * Class representing a state control button
 * @extends Button
 */
class StateButton extends Button {
  /**
   * Creates a state button
   * @param {String} name Button shortname
   * @param {String} text Button text
   * @param {HTMLElement} parent Button HTML Parent
   * @param {String} bgColor Button background color
   * @param {Boolean} hazard if the state it represents is hazardous
   * @param {State} state State this button represents
   */
  constructor(name, text, parent, bgColor, hazard, state) {
    super(name, text, parent, bgColor, 'white', hazard);
    this.state = state;
    this.domElement.className = 'stateButtonInactive';
  }

  /**
   * Sets the state button to active
   * @override
   */
  activate() {
    this.domElement.className = 'stateButton';
  }

  /**
   * Sets the state button to inactive
   * @override
   */
  deactivate() {
    this.domElement.className = 'stateButtonInactive';
  }
}

module.exports = StateButton;
