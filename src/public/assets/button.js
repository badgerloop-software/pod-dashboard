class Button {
  constructor(name, text, parent, bgColor, txtColor, hazard) {
    if (!name || !text) {
      throw new Error('Button needs name and text defined!');
    }
    this.name = name;
    this.text = text;
    this.domElement = this.createNewElement();
    this.parent = parent;

    if (this.parent) {
      if (typeof this.parent !== 'object') {
        console.log(`The type is ${typeof parent}`);
      }
      parent.appendChild(this.domElement);
    }

    this.color = { bgColor, txtColor };
    if (this.color.bgColor) {
      if (typeof this.color.bgColor !== 'string') {
        throw new Error('The background color must be a string');
      }
      this.domElement.style.backgroundColor = this.color.bgColor;
    }

    if (this.color.txtColor) {
      if (typeof this.color.txtColor !== 'string') {
        throw new Error('The text color must be a string');
      }
      this.domElement.style.color = this.color.txtColor;
    }
    if (hazard) {
      this.domElement.style.borderColor = 'red';
    }
  }

  activate() {
    this.setTextColor('lime');
  }

  deactivate() {
    this.setTextColor('white');
  }


  greyOut() {
    this.domElement.classList.add('stateButtonInactive');
    this.domElement.classList.remove('stateButton');
  }

  colorize() {
    this.domElement.classList.remove('stateButtonInactive');
    this.domElement.classList.add('stateButton');
  }

  setTextColor(color) {
    this.txtColor = color;
    this.domElement.style.color = this.txtColor;
  }

  createNewElement() {
    let button = document.createElement('button');
    button.className = 'stateButton';
    button.id = String(this.name).toLowerCase();
    let buttonText = document.createElement('p');
    buttonText.innerHTML = this.text;
    button.appendChild(buttonText);
    return button;
  }

  setText(text) {
    this.text = text;
    let textElement = this.domElement.children[0];
    textElement.innerHTML = text;
  }

  onClick(fcn) {
    this.domElement.addEventListener('click', fcn);
  }

  setParent(parent) {
    if (this.parent) { // If the button exists somewhere, remove it's instance
      this.domElement.remove();
    }
    this.parent = parent;
    this.parent.appendChild(this.domElement);
  }

  /**
   * Displays a confirmation window before transitioning to state
   * @param {HTMLElement} modalTemplate The template of the modal to display
   */
  confirmActive(modalTemplate, msg, cb) {
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
    button.addEventListener('click', () => { State.toggleConfirmationModal(modal); });
    text.innerHTML = `Are you sure you want to ${msg}?`;
    button.addEventListener('click', () => {
      this.activate();
      cb();
      modal.classList.toggle('show-modal');
      document.body.removeChild(modal);
    });
  }
}

module.exports = Button;
