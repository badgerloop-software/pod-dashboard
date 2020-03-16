const Button = require('./button');

class StateButton extends Button {
  constructor(name, text, parent, bgColor, hazard, state) {
    super(name, text, parent, bgColor, 'white', hazard);
    this.state = state;
    this.domElement.className = 'stateButtonInactive';
  }

  /**
   * @override
   */
  onClick(fcn) {
    this.domElement.addEventListener('click', fcn);
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
