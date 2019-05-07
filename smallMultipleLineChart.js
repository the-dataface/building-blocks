import * as util from "./utilities.js";
import * as globals from './_globals.js';

//---->GLOBAL VARIABLES FOR SMALL MULTIPLE LINE CHART<-----//
const container = d3.select('.multiple-line-wrapper');

let svgs,
  gs;

let outerW,
  outerH,
  margin,
  w,
  h;

let data,
  nested,
  line,
  x,
  y,
  r;

const xAccessor = 'xVal',
  yAccessor = 'yVal';

const parseX = d3.timeParse('%Y-%m-%d'),
  formatX = d3.timeFormat('%Y-%m');

function build() {
  container.selectAll('*').remove();

  const containers = container.selectAll('.multiple-line-container')
    .data(nested)
    .enter()
    .append('div')
    .attr('class', 'multiple-line-container');

  containers.append('p')
    .text(d => d.key)
    .style('margin', 0);

  svgs = containers.append('svg')
    .attr('width', outerW)
    .attr('height', outerH);

  gs = svgs.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const xAXis = d3.axisBottom(x)
    .ticks(4)
    .tickSizeOuter(0)
    .tickFormat(d => formatX(d));

  gs.append('g')
    .attr('transform', `translate(0, ${h})`)
    .attr('class', 'x axis')
    .call(xAXis);

  const yAxis = d3.axisLeft(y)
    .tickSizeOuter(0)
    .tickSize(-w);

  gs.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  gs.append('path')
    .datum(d => d.values)
    .attr('d', line)
    .attr('fill', 'none')
    .style('stroke-width', 2)

}

export function setup() {
  outerW = 200,
    outerH = 170;

  margin = {
    left: 20,
    right: 15,
    top: 10,
    bottom: 20
  };

  w = outerW - margin.left - margin.right,
    h = outerH - margin.top - margin.bottom;

  const xExtent = d3.extent(data, d => d[xAccessor]);
  const yExtent = d3.extent(data, d => d[yAccessor]);

  x = d3.scaleTime().domain(xExtent).range([0, w]),
    y = d3.scaleLinear().domain([0, yExtent[1]]).range([h, 0]);

  line = d3.line()
    .x(function(d) {
      return x(d[xAccessor])
    })
    .y(function(d) {
      return y(d[yAccessor])
    })
    .curve(d3.curveMonotoneX);

  build();
}

export function init() {
  d3.loadData('./assets/data/smallMultipleLineChart.csv', function(err, res) {
    data = res[0].map(d => {
      d[xAccessor] = parseX(d[xAccessor]);
      d[yAccessor] = +d[yAccessor];
      return d;
    })

    nested = d3.nest()
      .key(d => d.name)
      .entries(data);

    setup();
  })
}