module.exports = function Renderer() { // eslint-disable-line
  let self = this;
  this.counter = false;
  this.subCounter = false;
  this.interval = 500;
  this.run = false;
  this.lastRecievedTime = null;

  this.newCache = {};
  this.oldCache = {};

  this.runCommand = () => {
    di.packetHandler.emit('renderData');
  };

  this.startRenderer = () => {
    self.run = true;
    self.render();
  };

  this.stopRenderer = () => {
    self.run = false;
    clearTimeout(self.counter);
    clearTimeout(self.subCounter);
  };

  this.setInterval = (newTime) => {
    this.interval = newTime;
    this.stopRenderer();
    this.startRenderer();
  };

  this.render = () => {
    if (self.run) {
      self.counter = setTimeout(function run() {
        self.runCommand();
        self.subCounter = setTimeout(run, self.interval);
      }, self.interval);
    }
  };
};
