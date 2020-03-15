let Button = require('../assets/button');
let StateButton = require('../assets/StateButton');
const CLIENT = require('../javascripts/communication');
const DYNAMIC_LOADING = require('../javascripts/dynamicloading');

let STATES = [];
module.exports.STATES = STATES;
/**
 * Class reperesenting a state on the state machine
 */
class State {
  /**
   * Creates a state
   * @param {String} shortName code name for the state, no spaces
   * @param {String} displayName Display name for the buttons and console logs, any format
   * @param {Button} btn (Optional) Button to assign to state if button is already made,
   * if creating a button assign null
   * @param {String} btnColor Color to create state button
   * @param {Boolean} isHazardus If the state requires confirmation to transition to
   * @param {Boolean} isFault If the state is a fault state
   */
  constructor(shortName, displayName, btn, btnColor, isHazardus, isFault) {
    this.shortname = shortName;
    this.displayName = displayName;
    this.isHazardus = isHazardus;
    this.idNum = STATES.length;
    this.isFault = isFault;
    if (btn) {
      this.btn = btn;
    } else {
      this.btn = new StateButton(shortName, displayName, null, btnColor, isHazardus, this);
    }
    this.active = false;
    STATES.push(this);
  }

  /**
   * Either prompts the user to confirm activation or sets active state
   * @param {HTMLElement} modalTemplate The template of the modal to display
   */
  activate(modalTemplate) {
    if (this.isHazardus) {
      this.confirmActive(modalTemplate);
    } else {
      this.setActive();
    }
  }

  /**
   * Sets the state as the active state
   */
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

  /**
   * Sets the state as an inactive state
   */
  setInactive() {
    this.active = false;
    this.btn.deactivate();
  }

  /**
   * Toggles showing/hiding a modal
   * @param {HTMLElement} modal The modal to toggle
   */
  static toggleConfirmationModal(modal) {
    modal.classList.toggle('show-modal');
  }

  /**
   * Returns the active state
   * @returns {State} The active state
   */
  static getActiveState() {
    for (let i = 0; i < STATES.length; i++) {
      if (STATES[i].active) {
        return STATES[i];
      }
    }
    return -1;
  }
}

module.exports.State = State;
