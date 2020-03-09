class Button {
  constructor(name, text, parent, bgColor, txtColor, hazard, state) {
    if (!name || !text) {
      throw new Error('Button needs name and text defined!');
    }
    this.name = name;
    this.text = text;
    this.domElement = this.createNewElement();
    this.parent = parent;
    if (!state) {
      throw new Error('State Buttons must be created with a state!');
    }

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

  createNewElement() {
    let button = document.createElement('button');
    button.className = 'stateButtonInactive';
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

  activate() {
    this.domElement.className = 'stateButton';
  }

  deactivate() {
    this.domElement.className = 'stateButtonInactive';
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
}

module.exports = Button;
