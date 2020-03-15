const Button = require('./button');

class StateButton extends Button {
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

  /**
   * Displays a confirmation window before transitioning to state
   * @param {HTMLElement} modalTemplate The template of the modal to display
   * @override
   */
  confirmActive(modalTemplate) {
    let modal = modalTemplate.cloneNode(true);
    document.body.appendChild(modal);
    State.toggleConfirmationModal(modal);
    let button = modal.childNodes[1].childNodes[7];
    let text = modal.childNodes[1].childNodes[5];
    let closeButton = modal.childNodes[1].childNodes[1];
    closeButton.addEventListener('click', () => {
      modal.classList.toggle('show-modal');
      document.body.removeChild(modal);
    });
    console.log(button);
    button.addEventListener('click', () => { State.toggleConfirmationModal(modal); });
    text.innerHTML = `Are you sure you want to transition to ${this.text}?`;
    button.addEventListener('click', () => {
      this.state.setActive();
      modal.classList.toggle('show-modal');
      document.body.removeChild(modal);
    });
  }
}

module.exports = StateButton;
