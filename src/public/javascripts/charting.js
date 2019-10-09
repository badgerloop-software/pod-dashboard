let Highcharts = require('highcharts');

require('highcharts/modules/exporting')(Highcharts);

function newChart(id) {
  Highcharts.chart(id, {
    chart: {
    },
    title: {
      text: 'Fruit Consumption',
    },
    xAxis: {
      categories: ['Apples', 'Bananas', 'Oranges'],
    },
    yAxis: {
      title: {
        text: 'Fruit eaten',
      },
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
      name: 'Jane',
      data: [1, 0, 4],
    }, {
      name: 'John',
      data: [5, 7, 3],
    }],
  });
}
