let Button = require('../assets/button');
const CLIENT = require('../javascripts/communication');
const DYNAMIC_LOADING = require('../javascripts/dynamicloading');

let STATES = [];
module.exports.STATES = STATES;
class State {
  constructor(shortName, displayName, btn, btnColor, isHazardus, isFault) {
    this.shortname = shortName;
    this.displayName = displayName;
    this.isHazardus = isHazardus;
    this.idNum = STATES.length;
    this.isFault = isFault;
    if (btn) {
      this.btn = btn;
    } else {
      this.btn = new Button(shortName, displayName, null, btnColor, 'white', isHazardus, this);
    }
    this.active = false;
    STATES.push(this);
  }

  setActive() {
    this.active = true;
    STATES.forEach((state) => {
      state.setInactive();
    });
    this.active = true;
    this.btn.activate();
    CLIENT.sendOverride(this.shortName);
    if (!this.isFault) DYNAMIC_LOADING.switchState(this);
    else DYNAMIC_LOADING.setFault(this);
  }

  confirmActive(modalTemplate) {
    let modal = modalTemplate.cloneNode(true);
    document.body.appendChild(modal);
    modal.classList.toggle('show-modal');
    console.log(modal.childNodes);
    let button = modal.childNodes[1].childNodes[7];
    let text = modal.childNodes[1].childNodes[5];
    let closeButton = modal.childNodes[1].childNodes[1];
    closeButton.addEventListener('click', () => {
      modal.classList.toggle('show-modal');
      document.body.removeChild(modal);
    });
    console.log(button);
    button.addEventListener('click', toggleConfirmationModal);
    text.innerHTML = `Are you sure you want to transition to ${this.displayName}?`;
    button.addEventListener('click', () => {
      this.setActive();
      modal.classList.toggle('show-modal');
      document.body.removeChild(modal);
    });
  }

  setInactive() {
    this.active = false;
    this.btn.deactivate();
  }
}

module.exports.State = State;
