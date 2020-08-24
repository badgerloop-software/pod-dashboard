class Timer {
  constructor() {
    this.reference = new Date();
  }

  reset() {
    console.log('reset')
    this.reference = new Date();
  }

  get seconds() {
    return ((new Date() - this.reference) / 1000) % 60;
  }

  get minutes() {
    return Math.floor((new Date() - this.reference) / 60000);
  }
}

module.exports = Timer;
