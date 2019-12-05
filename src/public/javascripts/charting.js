const HIGHCHARTS = require('highcharts');
const CHARTCACHE = require('./cache');

require('highcharts/modules/exporting')(HIGHCHARTS);

let charts = []; // Array that stores charts
let interval = []; // Array that stores intervals
let value = [];
let time = [];

const pointSpacing = 0.03;
const minimumRange = 5;
const rate = 30; // in ms
const shiftThreshold = rate / pointSpacing;

/**
 * Adds a new chart
 * @param {String} id the id of the container for the chart
 * @param {String} title the title for the chart
 * @param {int} index the index in the charts array to store the chart
 */
function newChart(id, title, index) { //eslint-disable-line
  charts[index] = HIGHCHARTS.chart(id, {
    chart: {
      type: 'line',
      panning: true,
    },
    title: {
      text: title,
    },
    exporting: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    plotOptions: {
      series: {
        connectorAllowed: false,
        enableMouseTracking: false,
        pointInterval: pointSpacing,
      },
    },
    series: [{
      name: 'Empty',
      clip: false,
    }],
    xAxis: {
      minRange: minimumRange,
    },
  });
}

/**
 * Clears a chart
 * @param {int} index index of the chart to be cleared
 */
function clearChart(index) { //eslint-disable-line
  charts[index].xAxis[0].setExtremes(null, null);
  clearInterval(interval[index]);
  interval[index] = null;
  charts[index].update({
    title: {
      text: '',
    },
    series: [{
      name: '',
      data: [],
    }],
  });
}

/**
 * Initializes a chart
 * @param {int} index the index of the chart to initialize
 * @param {float} start the start time
 * @param {String} data the name of the data that will be charted
 * @param {String} title the title
 * @param {String} units the units of the data that will be charted
 */
function initialize(index, start, data, title, units) {
  charts[index].update({
    title: {
      text: title,
    },
    series: [{
      pointStart: start,
      name: data + units,
    }],
  });
}

function addData(index, name, system) { //eslint-disable-line
  value[index] = parseFloat(CHARTCACHE[system][name][CHARTCACHE[system][name].length - 1]);
  charts[index].series[0].addPoint(value[index], true, false, { duration: 30 });
  if (charts[index].series[0].data.length > shiftThreshold) {
    charts[index].series[0].data[0].remove(false, false);
  }
}

/**
 * Adds a time and data pair to the chart
 * @param {int} index the index of the chart
 * @param {String} name the data to be charted
 * @param {String} system the system of the data
 */
function addTimeAndData(index, name, system) { //eslint-disable-line
  value[index] = parseFloat(CHARTCACHE[system][name][CHARTCACHE[system][name].length - 1]);
  time[index] = CHARTCACHE[system][name].length * 0.03;
  charts[index].series[0].addPoint([time[index], value[index]], true, false, { duration: 30 });
  if (charts[index].xAxis[0].getExtremes().dataMax
    - charts[index].xAxis[0].getExtremes().dataMin >= 30) {
    charts[index].series[0].data[0].remove(false, false);
    charts[index].xAxis[0].setExtremes(time[index] - 30, time[index], true, false);
  }
}


/**
 * Initializes a chart and starts adding data
 * @param {int} index the index of the chart
 * @param {String} name the name of the data
 * @param {String} title the title for the chart
 * @param {String} system the system of the data
 * @param {String} units the units of the chart
 */
function startChart(index, name, title, system, units) { //eslint-disable-line
  currentTime = CHARTCACHE[system][name].length * 0.03;
  currentTime = parseFloat(currentTime);
  clearChart(index);
  initialize(index, currentTime, name, title, units);
  interval[index] = setInterval(() => { addTimeAndData(index, name, system); }, rate);
}
