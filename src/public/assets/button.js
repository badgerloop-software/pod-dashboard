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
    this.isHazardus = hazard;
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
    if (this.isHazardus) {
      this.action = fcn; // If the action requires confirmation save it for later
      this.domElement.addEventListener('click', () => {
        this.confirmActive();
      });
    } else this.domElement.addEventListener('click', fcn); // If it doesn't just assign a click listener
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
   */
  confirmActive() {
    let modal = Button.modal.cloneNode(true);
    document.body.appendChild(modal);
    Button.toggleConfirmationModal(modal);
    let button = modal.childNodes[1].childNodes[7];
    let text = modal.childNodes[1].childNodes[5];
    let closeButton = modal.childNodes[1].childNodes[1];
    closeButton.addEventListener('click', () => {
      modal.classList.toggle('show-modal');
      document.body.removeChild(modal);
    });
    button.addEventListener('click', () => { Button.toggleConfirmationModal(modal); });
    text.innerHTML = `Are you sure you want to trigger ${this.text}?`;
    button.addEventListener('click', () => {
      this.action();
      modal.classList.toggle('show-modal');
      document.body.removeChild(modal);
    });
  }

  /**
   * Toggles showing/hiding a modal
   * @param {HTMLElement} modal The modal to toggle
   */
  static toggleConfirmationModal(modal) {
    modal.classList.toggle('show-modal');
  }

  static setModalTemplate(template) {
    Button.modal = template;
  }
}

module.exports = Button;
