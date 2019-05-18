module.exports = function Renderer() { // eslint-disable-line
  this.counter = null;
  this.interval = 150;

  this.newCache = {};
  this.oldCache = {};

  this.startRenderer = () => {
    this.counter = setInterval(() => { di.packetHandler.emit('renderData', this.interval); });
  };

  this.stopRenderer = () => {
    clearInterval(this.counter);
    this.counter = false;
  };

  this.setInterval = (newTime) => {
    this.interval = newTime;
    this.stopRenderer();
    this.startRenderer();
  };

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
        console.log('prop names are different')
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
