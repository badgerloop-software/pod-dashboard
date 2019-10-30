let Highcharts = require('highcharts');
let chartCache = require('./cache');

require('highcharts/modules/exporting')(Highcharts);

let charts = []; // Array that stores charts
let interval = []; // Array that stores intervals

const pointSpacing = 0.03;
const minimumRange = 5;
const rate = 30;


function newChart(id, title, data) {
  charts.push(Highcharts.chart(id, {
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
  }));
}

function clearChart(index) {
  x = 14;
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

function addValues(index) {
  charts[index].update({
    title: {
      text: 'Add Values',
    },
    series: [{
      name: 'Temperature',
      data: [0, parseFloat(chartCache.motion.position[chartCache.motion.position.length - 1])],
    }],
  });
}

function randomValues() {
  let data = [];
  let time = new Date().getTime();
  for (i = 0; i < 35; i++) {
    data.push([
      time + i * 1000,
      Math.round(Math.random() * 100),
    ]);
  }
  return data;
}

function addRandomValues(index) {
  console.log('random');
  charts[index].update({
    title: {
      text: 'Add Random Values',
    },
    series: [{
      name: 'Temperature',
      data: randomValues(),
    }],
  });
}

function randomNumbers(index) {
  y = Math.random() * 5;
  charts[index].series[0].addPoint(y, true, false, { duration: 0 });
  if (charts[index].series[0].data.length > 1000) {
    charts[index].series[0].data[0].remove(false, false);
  }
}

function testData(index) {
  //console.log(chartCache.motion.position[chartCache.motion.position.length - 1]);
  y = parseFloat(chartCache.motion.position[chartCache.motion.position.length - 1]);
  charts[index].series[0].addPoint(y, true, false, { duration: 0 });
  if (charts[index].series[0].data.length > 1000) {
    charts[index].series[0].data[0].remove(false, false);
  }
}

function randomStream(index) {
  if (interval[index] == null) {
    addValues(index);
    interval[index] = setInterval(() => { testData(index); }, rate);
  }
}
