let Highcharts = require('highcharts');
let chartCache = require('./cache');

require('highcharts/modules/exporting')(Highcharts);

let charts = []; // Array that stores charts
let interval = []; // Array that stores intervals
let value = [];
let time = [];

const pointSpacing = 0.03;
const minimumRange = 5;
const rate = 30; // in ms
const shiftThreshold = rate / pointSpacing;

function newChart(id, title, index) { //eslint-disable-line
  charts[index] = Highcharts.chart(id, {
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
      cropThreshold: 10000,
      clip: false,
    }],
    xAxis: {
      minRange: minimumRange,
    },
  });
}

function clearChart(index) { //eslint-disable-line
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

function initialize(index, start, data, title, system, units) {
  console.log(start);
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
  value[index] = parseFloat(chartCache[system][name][chartCache[system][name].length - 1]);
  charts[index].series[0].addPoint(value[index], true, false, { duration: 30 });
  if (charts[index].series[0].data.length > shiftThreshold) {
    charts[index].series[0].data[0].remove(false, false);
  }
}

function addTimeAndData(index, name, system) { //eslint-disable-line
  value[index] = parseFloat(chartCache[system][name][chartCache[system][name].length - 1]);
  time[index] = chartCache[system][name].length * 0.03;
  charts[index].series[0].addPoint([time[index], value[index]], true, false, { duration: 30 });
  if (charts[index].series[0].data.length > shiftThreshold) {
    charts[index].series[0].data[0].remove(false, false);
  }
}

function startChart(index, name, title, system, units) { //eslint-disable-line
  currentTime = chartCache[system][name].length * 0.03;
  currentTime = parseFloat(currentTime);
  clearChart(index);
  initialize(index, currentTime, name, title, system, units);
  interval[index] = setInterval(() => { addTimeAndData(index, name, system); }, rate);
}
