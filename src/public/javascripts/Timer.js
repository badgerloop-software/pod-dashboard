/**
 * @module Timer
 * @author Ezra Boley, Eric Udlis
 * @description A generic count
 */
class Timer {
  constructor(domElement) {
    this.reference = new Date();
    if (!domElement) {
      throw new Error('Timer must be instantiated with a DOM element');
    }
    this.domElement = domElement;
  }

  reset() {
    this.reference = new Date();
  }

  get seconds() {
    let seconds = Math.round(((new Date() - this.reference) % 60000) / 1000);

    // Rounding sometimes means we display 60 seconds, which is non-standard.
    //  Therefor we trick users by just hanging for an extra second.
    //  Purely UX, doesn't change timing
    if (seconds === 60) seconds = 59;
    return seconds;
  }

  get minutes() {
    return Math.floor((new Date() - this.reference) / 60000);
  }

  display() {
    // The math here is a little intensive so lets only do it once
    const { minutes, seconds } = this;

    if (`${seconds}`.length === 1) this.domElement.innerHTML = `${minutes}:0${seconds}`;
    else this.domElement.innerHTML = `${minutes}:${seconds}`;
  }
}

module.exports = Timer;
