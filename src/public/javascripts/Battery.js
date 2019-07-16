function Battery(name, row, col) {
  this.name = name;
  this.voltage = null;
  this.temperature = null;
  this.row = row;
  this.col = col;

  this.setVoltage = function setVoltage(voltage) {
    this.voltage = voltage;
  };

  this.setTemp = function setTemp(temp) {
    this.temperature = temp;
  };

  this.getVoltage = function getVoltage() {
    return this.voltage;
  };

  this.getTemp = function getTemp() {
    return this.temperature;
  };
}
module.exports = Battery;
