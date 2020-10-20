/**
 * @module Renderer
 * @author Eric Udlis
 */
const { constants: CONSTANTS } = require('./config');

/**
 * @constructor
 * @description Represents a single renderer of tables
 */
module.exports = function Renderer() { // eslint-disable-line
    let self = this;
    this.counter = false;
    this.subCounter = false;
    this.interval = CONSTANTS.renderInterval;
    this.run = false;

    this.newCache = {};
    this.oldCache = {};

    this.runCommand = () => {
        DATA_INTERFACING.packetHandler.emit('renderData');
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
