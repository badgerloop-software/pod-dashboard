module.exports = function Renderer() { // eslint-disable-line
  let self = this;
  this.counter = false;
  this.subCounter = false;
  this.interval = 500;
  this.run = false;

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
      console.warn('heyyyyy');
      self.counter = setTimeout(function run() {
        self.runCommand();
        console.warn('Hey');
        self.subCounter = setTimeout(run, self.interval);
      }, self.interval);
    }
  }

  this.isEqual = (a, b) => {
    console.log(a);
    console.log(b);
    if (typeof a !== 'object' || typeof b !== 'object') {
      console.log('not being fed objects');
      return null;
    }
    // Create arrays of property names
    let aProps = Object.getOwnPropertyNames(a);
    let bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length !== bProps.length) {
      console.log('prop lengths are different');
      return false;
    }

    for (let i = 0; i < aProps.length; i++) {
      console.log('in first for loop');
      let propName = aProps[i];

      // If values of same property are not equal,
      // objects are not equivalent
      if (a[propName] !== b[propName]) {
        console.log('prop names are different');
        return false;
      }
      let aSubProps = Object.getOwnPropertyNames(a[propName]);
      // let bSubProps = Object.getOwnPropertyNames(b[propName]);

      for (let j = 0; j < aSubProps.length; j++) {
        let subProp = aSubProps[j];
        if (a[propName][subProp].length !== b[propName][subProp].length) {
          return false;
        }
      }
    }


    // If we made it this far, objects
    // are considered equivalent
    return true;
  };
};
