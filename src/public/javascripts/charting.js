/**
 * @module Highcharts
 * @author Andrew Janssen
 * @description Creates and handles charts
 */
const HIGHCHARTS = require('highcharts');
require('highcharts/modules/annotations')(HIGHCHARTS);
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
      events: {
        click: (event) => {
          addAnnotate(index, event.xAxis[0].value, event.yAxis[0].value); //eslint-disable-line
        },
      },
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
        enableMouseTracking: false, // shows point on hover
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
  clearAnnotate(index); //eslint-disable-line
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
  // charts[index].addAnnotation({
  //   labels: [{
  //     point: {
  //       x: time[index],
  //       y: value[index],
  //       xAxis: 0,
  //       yAxis: 0,
  //     },
  //   }],
  // });
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
function startChart(index, name, title, system, units) { //eslint-disable-line
  currentTime = CHARTCACHE[system][name].length * 0.03;
  currentTime = parseFloat(currentTime);
  clearChart(index);
  initialize(index, currentTime, name, title, units); // initialize new chart
  // start interval to add points to the chart
  interval[index] = setInterval(() => { addTimeAndData(index, name, system); }, rate);
}

function addAnnotate(index, time, value) { //eslint-disable-line

  // charts[index].annotations[0].labels[0].graphic.animate({
  //   x: time[index] * 10,
  //   y: value[index] * 10,
  //   xAxis: 0,
  //   yAxis: 0,
  // });
  charts[index].addAnnotation({
    id: 'time',
    labels: [{
      point: {
        x: time,
        y: value,
        xAxis: 0,
        yAxis: 0,
      },
    }],
    labelOptions: {
      allowOverlap: true,
    }
  });
}

function clearAnnotate(index) { //eslint-disable-line
  charts[index].annotations.forEach(a => a.destroy());
  charts[index].annotations.length = 0;
}