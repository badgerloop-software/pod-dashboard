function Timer() {
  this.seconds = 0;
  this.minutes = 0;
  this.process = false;

  this.count = function count() {
    this.seconds++;
    if (this.seconds === 60) {
      this.seconds = 0;
      this.minutes++;
    }
    setTimeout(count, 1000);
  };

  this.getSeconds = function getSeconds() {
    return this.seconds;
  };

  this.getMinutes = function getMinutes() {
    return this.minutes;
  };

  this.start = function start() {
    this.count();
  };
  this.stop = function stop() {
    clearTimeout(this.process);
    this.process = false;
  };

  this.reset = function reset() {
    this.seconds = 0;
    this.minutes = 0;
  };
}

module.exports = Timer;
