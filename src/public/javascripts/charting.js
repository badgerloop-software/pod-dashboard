let Highcharts = require('highcharts');

require('highcharts/modules/exporting')(Highcharts);

let charts = []; // Array that stores charts

function newChart(id, title) {
  charts.push(Highcharts.chart(id, {
    chart: {
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
      },
    },
    series: [{
      name: 'Empty',
    }],
  }));
}

function clearChart(index) {
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
      data: [1, 0, 4, 6, 7, 8, 9, 1, 4, 6, 7, 8, 9, 3],
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

function stream() {
  let data = []
  return data.push(Math.random());
}

let x = 10;

function randomStream(index) {
  addValues(index);
  setInterval(() => {
    y = Math.random() * 5;
    x += 1;
    charts[index].series[0].addPoint([x, y], true, true);
  }, 1000);

}
