let Button = require('../assets/button');

let STATES = [];
module.exports.STATES = STATES;
class State {
  constructor(shortName, displayName, btn, btnColor, hazardus) {
    this.shortname = shortName;
    this.displayName = displayName;
    this.hazardus = hazardus;
    this.idNum = STATES.length;
    if (btn) {
      this.btn = btn;
    } else {
      this.btn = new Button(shortName, displayName, null, btnColor, 'white', hazardus, this);
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
  }

  setInactive() {
    this.active = false;
    this.btn.deactivate();
  }
}

module.exports.State = State;
