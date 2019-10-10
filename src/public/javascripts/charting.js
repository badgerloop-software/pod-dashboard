let Highcharts = require('highcharts');

require('highcharts/modules/exporting')(Highcharts);

let charts = [];

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
      name: 'Temperature',
      data: [1, 0, 4, 6, 7, 8],
    }, {
      name: 'Height',
      data: [5, 7, 3, 1, 5, 2],
    }],
  }));
}

function changeTitle(index) {
  charts[index].update({
    title: {
      text: 'scroll',
    },
  });
}
