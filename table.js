import * as util from "./utilities.js";
import * as globals from './_globals.js';

const container = d3.select('.table-container');

let table;

let w,
  rowh = 40;

let data;

// specifiy header names as an array and number of rows as an integer, otherwise will use all columns/rows
let headers = [],
  n;

// specifiy sort order (true = ascending, false = descending) and column
let ascending = true,
  sortAccessor; // if not specified, defaults to first column

function build() {
  container.selectAll('*:not(.tooltip)').remove();

  table = container.append('table');

  table.style('width', `${w}px`).style('height', `${data.length*rowh}px`);

  // append table header with column headers
  table.append('thead').append('tr')
    .selectAll('th')
    .data(headers).enter()
    .append('th')
    .text(d => d);

  // append rows
  const rows = table.append('tbody').selectAll('tr')
    .data(data).enter()
    .append('tr')
    .style('height', `${rowh}px`);

  // append a cell for each column specified in headers
  rows.selectAll('td')
    .data(d => headers.map(s => {
      return {
        name: s,
        value: d[s]
      }
    }))
    .enter()
    .append('td')
    .style('font-family', d => (/^\d+$/.test(d.value)) ? `Roboto Mono` : `Heebo`)
    .text(d => d.value);

}

export function setup() {
  w = container.node().offsetWidth;

  build();
}

export function init() {
  d3.loadData('./assets/data/table.csv', function(err, res) {
    data = res[0].map(d => {
      return d;
    });

    // get array of column headers if not specified
    if (headers.length === 0) headers = d3.keys(data[0]);

    // convert columns to integers
    data.forEach(d => headers.map(s => {
      return d[s] = (/^\d+$/.test(d[s])) ? +d[s] : d[s];
    }));

    // get sort accessor if unspecified
    if (!sortAccessor) sortAccessor = headers[0];

    // sort by column
    data.sort((a, b) => ascending ? d3.ascending(a[sortAccessor], b[sortAccessor]) : d3.descending(a[sortAccessor], b[sortAccessor]));

    // slice to specified length
    if (n) data.splice(n);

    setup();
  })
}