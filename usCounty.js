import * as util from "./utilities.js";
import * as globals from './_globals.js';

//---->GLOBAL VARIABLES FOR US COUNTY<-----//

const container = d3.select('.map-container');

let svg,
  g;

let tooltip = container.select('.tooltip');

let outerW,
  outerH,
  margin,
  w,
  h;

let counties,
  countiesMesh,
  projection,
  path;

function build() {
  // Set up containers
  container.selectAll('*:not(.tooltip)').remove();

  svg = container.append('svg')
    .attr('width', outerW)
    .attr('height', outerH);

  g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  g.append('g')
    .attr('class', 'county-lines')
    .selectAll('path')
    .data(counties.features)
    .enter()
    .append('path')
    .attr('d', path)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);
}

function mousemove(d) {
  d = d.properties;

  const x = d3.mouse(svg.node())[0],
    y = d3.mouse(svg.node())[1];

  tooltip.style('display', 'block')
    .style('transform', util.tooltipPosition(w, margin, x, y))
    .html(`<h6>${d.NAME}</h6>`);
}

function mouseout() {
  tooltip.style('display', 'none')
}

export function setup() {
  outerW = container.node().offsetWidth;
  outerH = container.node().offsetHeight;

  margin = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10
  };

  w = outerW - margin.left - margin.right;
  h = outerH - margin.top - margin.bottom;

  getProjectionParameters();
  build();
}

export function init() {
  d3.loadData('./assets/data/usCounty.json', function(err, res) {
    counties = res[0];
    setup();
  })
}

function getProjectionParameters() {
  projection = d3.geoAlbersUsa()
    .scale(1)
    .translate([0, 0]);

  path = d3.geoPath()
    .projection(projection);

  const b = path.bounds(counties),
    s = .95 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h),
    t = [(w - s * (b[1][0] + b[0][0])) / 2, (h - s * (b[1][1] + b[0][1])) / 2];

  projection
    .scale(s)
    .translate(t);
}

// export default {
//   init
// };