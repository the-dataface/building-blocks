import * as util from "./utilities.js";
import * as globals from './_globals.js';

const container = d3.select('.multiple-table-wrapper');

let tables;

let w,
  rowh = 40;

let data,
  nested;

// specifiy header names as an array and number of rows as an integer, otherwise will use all columns/rows. These will be for all tables
let headers = [],
  n;

// what should we nest by?
const groupBy = 'name';

// specifiy sort order (true = ascending, false = descending) and column
let ascending = true,
  sortAccessor; // if not specified, defaults to first column

function build() {
  container.selectAll('*:not(.tooltip)').remove();

  const containers = container.selectAll('.multiple-table-container')
    .data(nested)
    .enter()
    .append('div')
    .attr('class', 'multiple-table-container');

  tables = containers.append('table');

  tables.style('width', `${w}px`).style('height', d => `${d.values.length*rowh}px`);

  // append table header with column headers
  tables.append('thead').append('tr')
    .selectAll('th')
    .data(d => headers).enter()
    .append('th')
    .text(d => d);

  // append rows
  const rows = tables.append('tbody').selectAll('tr')
    .data(d => d.values).enter()
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
  w = ($('.multiple-table-wrapper').width() / 4) - 20;
  if (w < 200) w = 200;
  build();
}

export function init() {
  d3.loadData('./assets/data/smallMultipleTable.csv', function(err, res) {
    data = res[0].map(d => {
      return d;
    });

    nested = d3.nest()
      .key(d => d[groupBy])
      .entries(data);

    nested.forEach(d => {
      // get array of column headers if not specified
      if (headers.length === 0) headers = d3.keys(d.values[0]);

      // convert columns to integers
      d.values.forEach(s => headers.map(t => {
        return s[t] = (/^\d+$/.test(s[t])) ? +s[t] : s[t];
      }));

      // get sort accessor if unspecified
      if (!sortAccessor) sortAccessor = headers[0];

      // sort by column
      d.values.sort((a, b) => ascending ? d3.ascending(a[sortAccessor], b[sortAccessor]) : d3.descending(a[sortAccessor], b[sortAccessor]));

      // slice to specified length
      if (n) d.values = d.values.slice(0, n);
    })

    setup();
  })
}