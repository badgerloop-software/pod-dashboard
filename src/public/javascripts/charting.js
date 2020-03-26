/* eslint-disable no-unused-vars */
/**
 * @module Highcharts
 * @author Andrew Janssen
 * @description Creates and handles charts
 */
const HIGHCHARTS = require('highcharts');
const CHARTCACHE = require('./cache');
const Dropdown = require('./public/assets/Dropdown');

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
    },
    title: {
      text: title,
    },
    exporting: {
      enabled: false, // removes exporting hamburger menu
    },
    credits: {
      enabled: false, // removes Highchart logo
    },
    plotOptions: {
      series: {
        enableMouseTracking: true, // shows point on hover
        pointInterval: pointSpacing, // interval between points
      },
    },
    series: [{
      name: 'Empty',
      clip: true, // doesn't render points off chart
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
  charts[index].xAxis[0].setExtremes(null, null); // unsets extremes
  clearInterval(interval[index]); // clears interval
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
      pointStart: start, // start point for data
      name: data + units,
    }],
  });
}

/**
 * Adds a data point to the chart
 * @param {int} index index of the chart
 * @param {String} name data to be charted
 * @param {String} system system of the data
 */
function addData(index, name, system) { //eslint-disable-line
  // stores last value
  value[index] = parseFloat(CHARTCACHE[system][name][CHARTCACHE[system][name].length - 1]);
  charts[index].series[0].addPoint(value[index], true, false, { duration: 30 }); // adds point
  if (charts[index].series[0].data.length > shiftThreshold) {
    charts[index].series[0].data[0].remove(false, false); // removes old point
  }
}

/**
 * Adds a time and data pair to the chart
 * @param {int} index the index of the chart
 * @param {String} name the data to be charted
 * @param {String} system the system of the data
 */
function addTimeAndData(index, name, system) { //eslint-disable-line
  // stores last value and current time
  value[index] = parseFloat(CHARTCACHE[system][name][CHARTCACHE[system][name].length - 1]);
  time[index] = CHARTCACHE[system][name].length * 0.03;
  // adds pair to the chart
  charts[index].series[0].addPoint([time[index], value[index]], true, false, { duration: 30 });
  // removes and shifts if 30 seconds of data are present
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
function startChart(name, title, units, system, fixedUnits, index) { //eslint-disable-line
  console.log(`CHARTCAHCE : ${CHARTCACHE} SYSTEM: ${system} NAME: ${name} TITLE: ${title} INDEX: ${index}`);
  currentTime = CHARTCACHE[system][name].length * 0.03;
  currentTime = parseFloat(currentTime);
  clearChart(index);
  initialize(index, currentTime, name, title, units); // initialize new chart
  // start interval to add points to the chart
  interval[index] = setInterval(() => { addTimeAndData(index, name, system); }, rate);
}


const CHART_ONE_BUTTON = new Dropdown('chartOneAdd', 'Add Values Chart 1', document.getElementById('chartBox'), true, startChart, 0);
const CHART_TWO_BUTTON = new Dropdown('chartTwoAdd', 'Add Values Chart 2', document.getElementById('chartBox'), true, startChart, 1);
const CLEAR_CHART_BUTTON = new Dropdown('clearCharts', 'Clear Charts', document.getElementById('chartBox'), false);
CLEAR_CHART_BUTTON.onClick(() => {
  clearChart(0);
  clearChart(1);
});
