import * as util from "./utilities.js";
import * as globals from './_globals.js';

const container = d3.select('.multiple-armadillo-wrapper'),
  tooltip = container.select('.tooltip');

let svgs,
  gs;

let outerW,
  outerH,
  margin,
  w,
  h;

let data,
  nested,
  x,
  y,
  r;

const armadillo = d3.pie(),
  arc = d3.arc();

// what should we nest by?
const groupBy = 'name';

const valAccessor = 'val',
  xAccessor = 'category';

function build() {
  container.selectAll('*:not(.tooltip)').remove();

  const containers = container.selectAll('.multiple-armadillo-container')
    .data(nested)
    .enter()
    .append('div')
    .attr('class', 'multiple-armadillo-container');

  containers.append('p')
    .text(d => d.key)
    .style('margin', 0);

  svgs = containers.append('svg')
    .attr('width', outerW)
    .attr('height', outerH);

  gs = svgs.append('g')
    .attr('transform', d => `rotate(${(360/d.values.length)/2} ${w/2} ${h/2}) translate(${margin.left + (w/2)}, ${margin.top + (h/2)})`);

  // add axes
  const rAxis = gs.append('g')
    .attr('class', 'axis')

  const xAxis = d3.axisBottom(r)
    .ticks(4)
    .tickSize(0)
    .tickFormat(d => {
      if (d != 0) return d
    })

  svgs.append('g')
    .attr('transform', `rotate(-90 ${w/2} ${h/2}) translate(${(w/2) - margin.top}, ${(h/2)})`)
    .attr('class', 'x axis text-bg')
    .call(xAxis);

  svgs.append('g')
    .attr('transform', `rotate(-90 ${w/2} ${h/2}) translate(${(w/2) - margin.top}, ${(h/2)})`)
    .attr('class', 'x axis')
    .call(xAxis);

  rAxis.selectAll('circle')
    .data(r.ticks(4))
    .enter().append('circle')
    .attr('r', d => r(d));

  // draw the thing
  gs.selectAll('.armadillo')
    .data(d => armadillo(d.values))
    .enter().append('path')
    .attr('class', 'armadillo')
    .attr('d', arc)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);
}

function mousemove(d) {
  d = d.data;

  const xPos = d3.mouse(container.node())[0] - w,
    yPos = d3.mouse(container.node())[1];

  tooltip.style('display', 'block')
    .style('transform', util.tooltipPosition(w, margin, xPos, yPos))
    .html(`<h6>${d[xAccessor]}</h6><p><strong>Value</strong>: ${d[valAccessor]}`);
}

function mouseout() {
  tooltip.style('display', 'none');
}

export function setup() {
  let inrow = 4;
  if ($('.multiple-armadillo-wrapper').width() / 220 < inrow) inrow = Math.floor($('.multiple-armadillo-wrapper').width() / 220);
  outerW = ($('.multiple-armadillo-wrapper').width() / inrow) - 20;
  if (outerW < 200) outerW = 200;

  outerH = outerW;

  margin = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10
  };

  w = outerW - margin.left - margin.right;
  h = outerH - margin.top - margin.bottom;

  const max = d3.max(data, d => d[valAccessor]);

  r = d3.scaleSqrt().domain([0, max]).range([0, (w / 2)]);

  armadillo.value(1);
  arc.innerRadius(0)
    .outerRadius(d => r(d.data[valAccessor]));

  build();
}

export function init() {
  d3.loadData('./assets/data/smallMultipleArmadilloChart.csv', function(err, res) {
    data = res[0].map(d => {
      d[valAccessor] = +d[valAccessor];
      return d;
    })

    nested = d3.nest()
      .key(d => d[groupBy])
      .entries(data);

    // add an empty bit?
    nested.forEach(d => {
      d.values.push({
        name: d.key,
        category: 'null',
        value: 0
      })
    })

    setup();
  })
}