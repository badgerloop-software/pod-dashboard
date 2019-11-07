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
      text: 'Clear',
    },
    series: [{
      name: '',
      data: [],
    }],
  });
}

function initialize(index, start, name) {
  charts[index].update({
    title: {
      text: 'Add Values',
    },
    plotOptions: {
      series: {
      },
    },
    series: [{
      name: 'Temperature',
      data: [[start, parseFloat(chartCache.motion.position[chartCache.motion.position.length - 1])]],
    }],
  });
}

function testData(index) {
  y = parseFloat(chartCache.motion.position[chartCache.motion.position.length - 1]);
  charts[index].series[0].addPoint(y, true, false, { duration: 30 });
  if (charts[index].series[0].data.length > shiftThreshold) {
    charts[index].series[0].data[0].remove(false, false);
  }
}

function startChart(index) { //eslint-disable-line
  if (interval[index] == null) {
    setTimeout(() => {
      initialize(index, 10);
    }, 30);
    interval[index] = setInterval(() => { testData(index); }, rate);
  }
}
