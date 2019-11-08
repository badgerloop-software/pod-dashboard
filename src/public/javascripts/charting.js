let Highcharts = require('highcharts');
let chartCache = require('./cache');

require('highcharts/modules/exporting')(Highcharts);

let charts = []; // Array that stores charts
let interval = []; // Array that stores intervals

const pointSpacing = 0.03;
const minimumRange = 5;
const rate = 30;
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
      line: {
      },
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
      text: 'Cleared',
    },
    series: [{
      name: '',
      data: [],
    }],
  });
}

function initialize(index, start, data, title, system, units) {
  charts[index].update({
    title: {
      text: title,
    },
    plotOptions: {
      series: {
      },
    },
    series: [{
      name: data + units,
      data: [[start,
        parseFloat(chartCache[system][data][chartCache[system][data].length - 1])]],
    }],
  });
}

function testData(index, name, system) {
  y = parseFloat(chartCache[system][name][chartCache[system][name].length - 1]);
  charts[index].series[0].addPoint(y, true, false, { duration: 30 });
  if (charts[index].series[0].data.length > shiftThreshold) {
    charts[index].series[0].data[0].remove(false, false);
  }
}

function startChart(index, name, title, system, units) { //eslint-disable-line
  currentTime = 10;
  clearChart(index);
  setTimeout(() => {
    initialize(index, currentTime, name, title, system, units);
  }, rate);
  interval[index] = setInterval(() => { testData(index, name, system); }, rate);
}
