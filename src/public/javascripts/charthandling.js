/*
Author: Alex Vesel
Purpose: Create, fill, and clear charts using Plotly.js
*/

// global variable initilization for chart execution
noData1 = 0;
noData2 = 0;

xpos = 0;
chartState1 = [0, 0];
chartTDID1 = ['', ''];
traceArray1 = [0];
chartData1 = [0, 0];
numTraces1 = 0;
yData1 = [];
chartFirstCreation1 = 0;
chartTitles1 = ['', ''];

chartState2 = [0, 0];
chartTDID2 = ['', ''];
traceArray2 = [0];
chartData2 = [0, 0];
numTraces2 = 0;
yData2 = [];
chartFirstCreation2 = 0;
chartTitles2 = ['', ''];

let chartInterval1 = false;
let chartInterval2 = false;
sampleRate = 100; // sample rate in ms per sample
xmax = 30; // x-axis range (seconds)

// function to generate blank chart on startup and clear
function generateBlankChart(id, title, chartType) { // eslint-disable-line no-unused-vars
  const layout = {
    xaxis: { range: [0, xmax] },
    title,
    // width: 250,
    height: 300,
    margin: {
      l: 30,
      r: 20,
      b: 20,
      t: 30,
    },
  };

  Plotly.newPlot(
    id,
    [
      {
        y: [],
        type: chartType,
      },
    ],
    layout,
  );
}

// function to remove all traces from all charts, resets global variables
function removeTraces() { // eslint-disable-line no-unused-vars
  chartState1 = [0, 0];
  chartState2 = [0, 0];
  chartTDID1 = ['', ''];
  chartTDID2 = ['', ''];
  traceArray1 = [0];
  traceArray2 = [0];
  numTraces1 = 0;
  numTraces2 = 0;
  chartTitles1 = ['', ''];
  chartTitles2 = ['', ''];
}

// contains all functions to add single and double traces to line chart one
function generateLineChartOne(tdID, title) { // eslint-disable-line no-unused-vars
  let update;
  const sampleRate = 300; // sample rate in ms per sample
  const layout = {
    xaxis: {
      rangemode: 'tozero',
      autorange: true, // set true to have plot condense as time progresses
    },
    showlegend: false,
    title: '',
    // width: 220, Removing this makes the chart fill the div
    height: 300,
    margin: {
      l: 30,
      r: 20,
      b: 20,
      t: 30,
    },
  };

  // gets data from selected table cell
  function getData() { // eslint-disable-line no-unused-vars
    for (i = 0; i <= numTraces1 - 1; i += 1) {
      const value = document.getElementById(chartTDID1[i]);
      chartData1[i] = value.innerHTML;
    }
  }

  // extends line chart one traces at each time step
  function getDataAtInterval() { // eslint-disable-line no-unused-vars
    chartDataPrev1 = -1000;
    chartInterval1 = setInterval(() => {
      xpos += sampleRate / 1000;
      getData();
      if (numTraces1 === 1 && !noData1) {
        update = {
          x: [[xpos]],
          y: [[chartData1[0]]],
        };
        Plotly.extendTraces(lineChartOne, update, traceArray1);
      } else if (numTraces1 === 2 && !noData1) {
        update = {
          x: [[xpos], [xpos]],
          y: [[chartData1[0]], [chartData1[1]]],
        };
        Plotly.extendTraces(lineChartOne, update, traceArray1);
      }
      if (xpos > 30) {
        Plotly.relayout(lineChartOne, 'xaxis.range', [xpos - xmax, xpos]);
      }
      if (chartDataPrev1 === chartData1[0]) {
        noData1 = 1;
      } else {
        noData1 = 0;
      }
      chartDataPrev1 = chartData1[0];
    }, sampleRate);
  }

  function newChart() { // eslint-disable-line no-unused-vars
    getData();

    Plotly.newPlot(
      lineChartOne,
      [
        {
          x: [xpos],
          y: [chartData1[0]],
          type: 'scatter',
          mode: 'lines',
          line: { color: '#95A5A6' },
        },
      ],
      layout,
    );

    if (chartFirstCreation1 === 0) {
      getDataAtInterval();
    }
  }

  // function to add trace to line chart one
  function addTrace() { // eslint-disable-line no-unused-vars
    Plotly.relayout(lineChartOne, layout);
    Plotly.addTraces(lineChartOne, [
      {
        x: [xpos],
        y: [chartData1[1]],
        type: 'scatter',
        mode: 'lines',
        line: { color: '#2D3131' },
      },
    ]);
  }

  if (chartState1[0] === 0) {
    // checks if chart one is empty
    chartTDID1[0] = tdID;
    traceArray1 = [0];
    chartTitles1[0] = title;
    layout.title = chartTitles1[0];
    numTraces1 = 1;
    newChart();
    chartFirstCreation1 = 1;
    chartState1[0] = 1;
  } else if (chartState1[1] === 0) {
    // checks if chart one has second trace
    chartTDID1[1] = tdID;
    traceArray1 = [0, 1];
    numTraces1 = 2;
    chartTitles1[1] = title;
    layout.title = `${chartTitles1[0]}, <br>${chartTitles1[1]}`;
    addTrace();
    chartState1[1] = 1;
  }
}

// contains all functions to add single and double traces to line chart two
function generateLineChartTwo(tdID, title) { // eslint-disable-line no-unused-vars
  let update;
  const sampleRate = 300; // sample rate in ms per sample
  const layout = {
    xaxis: {
      rangemode: 'tozero',
      autorange: true, // set true to have plot condense as time progresses
    },
    showlegend: false,
    title: '',
    // width: 220,
    height: 300,
    margin: {
      l: 30,
      r: 20,
      b: 20,
      t: 30,
    },
  };

  // gets data from selected table cell
  function getData() { // eslint-disable-line no-unused-vars
    for (i = 0; i <= numTraces2 - 1; i += 1) {
      const value = document.getElementById(chartTDID2[i]);
      chartData2[i] = value.innerHTML;
    }
  }

  // extends line chart two traces at each time step
  function getDataAtInterval() { // eslint-disable-line no-unused-vars
    chartDataPrev2 = -1000;
    chartInterval2 = setInterval(() => {
      if (chartFirstCreation1 === 0) {
        xpos += sampleRate / 1000;
      }
      getData();
      if (numTraces2 === 1 && !noData2) {
        update = {
          x: [[xpos]],
          y: [[chartData2[0]]],
        };
        Plotly.extendTraces(lineChartTwo, update, traceArray2);
      } else if (numTraces2 === 2 && !noData2) {
        update = {
          x: [[xpos], [xpos]],
          y: [[chartData2[0]], [chartData2[1]]],
        };
        Plotly.extendTraces(lineChartTwo, update, traceArray2);
      }
      if (xpos > 30) {
        Plotly.relayout(lineChartTwo, 'xaxis.range', [xpos - xmax, xpos]);
      }
      if (chartDataPrev2 === chartData2[0]) {
        noData2 = 1;
      } else {
        noData2 = 0;
      }
      chartDataPrev2 = chartData2[0];
    }, sampleRate);
  }

  function newChart() { // eslint-disable-line no-unused-vars
    getData();

    Plotly.newPlot(
      lineChartTwo,
      [
        {
          x: [xpos],
          y: [chartData2[0]],
          type: 'scatter',
          mode: 'lines',
          line: { color: '#95A5A6' },
        },
      ],
      layout,
    );

    if (chartFirstCreation2 === 0) {
      getDataAtInterval();
    }
  }

  // function to add trace to line chart two
  function addTrace() { // eslint-disable-line no-unused-vars
    Plotly.relayout(lineChartTwo, layout);
    Plotly.addTraces(lineChartTwo, [
      {
        x: [xpos],
        y: [chartData2[1]],
        type: 'scatter',
        mode: 'lines',
        line: { color: '#2D3131' },
      },
    ]);
  }

  if (chartState2[0] === 0) {
    // checks if chart two is empty
    chartTDID2[0] = tdID;
    traceArray2 = [0];
    chartTitles2[0] = title;
    layout.title = chartTitles2[0];
    numTraces2 = 1;
    newChart();
    chartFirstCreation2 = 1;
    chartState2[0] = 1;
  } else if (chartState2[1] === 0) {
    // checks if chart two has second trace
    chartTDID2[1] = tdID;
    traceArray2 = [0, 1];
    numTraces2 = 2;
    chartTitles2[1] = title;
    layout.title = `${chartTitles2[0]}, <br>${chartTitles2[1]}`;
    addTrace();
    chartState2[1] = 1;
  }
}

function pauseCharts() { // eslint-disable-line
  clearInterval(chartInterval1);
  clearInterval(chartInterval2);
}

// eslint-disable-next-line no-unused-vars
function playCharts() {
  getDataAtInterval();
}
