function Countdown(countdownSeconds) {
  this.countdownTime = countdownSeconds; // In seconds
  this.currentTime = Date.parse(new Date());
  this.deadline = new Date(this.currentTime + this.countdownTime * 1000);
  this.secondsRemaining = countdownSeconds;
  this.minutesRemaining = 0;
  this.paused = null;
  this.timeInterval = null;
  let top = this;

  this.getTimeRemaining = function getTimeRemaining(endTime) {
    let t = Date.parse(endTime) - Date.parse(new Date());
    console.log(t);
    let seconds = Math.floor((t / 1000) % 60);
    let minutes = Math.floor((t / 1000 / 60) % 60);
    console.log(`Minutes: ${minutes} Seconds: ${seconds}`);
    return { min: minutes, sec: seconds };
  };


  this.runClock = function runClock(endTime) {
    function updateClock() {
      let t = top.getTimeRemaining(endTime);
      this.secondsRemaining = t.sec;
      this.minutesRemaining = t.min;
      console.log(`${this.minutesRemaining}:${this.secondsRemaining}`);
    }
    updateClock();
    this.timeInterval = setInterval(updateClock, 1000);
  };

  this.start = function start() {
    top.runClock(top.deadline);
  };

  this.pauseClock = function pauseClock() {
    if (!paused) {
      paused = true;
      clearInterval(this.timeInterval);
      this.timeLeft = time_remaining(deadline).seconds;
    }
  };

  this.resumeClock = function resumeClock() {
    if (paused) {
      paused = false;
      deadline = new Date(Date.parse(new Date()) + this.timeLeft);
      this.runClock(deadline);
    }
  };

  this.getSeconds = function getSeconds() {
    return this.secondsRemaining;
  };

  this.getMinutes = function getMinutes() {
    return this.minutesRemaining;
  };
}

module.exports = Countdown;
