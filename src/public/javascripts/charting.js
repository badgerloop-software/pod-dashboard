let Highcharts = require('highcharts');

require('highcharts/modules/exporting')(Highcharts);

let charts = []; // Array that stores charts

function newChart(id, title) {
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
      data: [1, 0, 4, 6, 7, 8],
    }],
  });
}
