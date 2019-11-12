import * as util from './utilities.js';
import * as globals from './_globals.js';

const container = d3.select('.stacked-bar-container'),
	tooltip = container.select('.tooltip'),
	tooltipW = +tooltip.style('width').replace('px', '');

let svg,
	g,
  gs,
  bars;

let outerW,
	outerH,
	margin,
	w,
	h;

let data,
  stackedData,
	x,
  y,
  z;

const xAccessor = 'name',
	yAccessors = ['y1Val', 'y2Val', 'y3Val'];

const barH = 30;

function build() {
	container.selectAll('*:not(.tooltip)').remove();

	svg = container.append('svg')
		.attr('width', outerW)
		.attr('height', outerH);

	g = svg.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	// Add axes
	const xAxis = g.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0,${h})`)
		.call(d3.axisBottom(x)
			.tickSize(0)
			.tickSizeOuter(0)
			.tickPadding(10)
		);

	const yAxis = g.append('g')
		.attr('class', 'y axis')
		.call(d3.axisLeft(y)
			.tickSize(0)
			.tickSizeOuter(0)
			.tickPadding(5)
    );
    
  const layers = g.selectAll('.layer')
    .data(stackedData)
    .enter()
    .append('g')
    .attr('class', 'layer')
    .style('fill', (d, i) => z(i))

  layers.selectAll('rect')
    .data(d => d)
    .enter()
    .append('rect')
    .attr('x', d => x(d.data.name))
    .attr('y', d => y(d[1]))
    .attr('height', d => y(d[0]) - y(d[1]))
    .attr('width', x.bandwidth() - 1)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);
}

function mousemove(d, i) {
  const layerName = d3.select(this.parentNode).datum().key;
  const value = d[1] - d[0];

	const xPos = d3.mouse(svg.node())[0],
		yPos = d3.mouse(svg.node())[1];

	tooltip.style('display', 'block')
		.style('transform', util.tooltipPosition(w, margin, xPos, yPos, tooltipW))
		.html(`<h6>${d.data[xAccessor]}</h6><p><strong>layer</strong>: ${layerName}</p><p><strong>y</strong>: ${value}</p>`);
}

function mouseout() {
	tooltip.style('display', 'none');
}

export function setup() {
	outerW = container.node().offsetWidth;
	outerH = container.node().offsetHeight;

	margin = {
		left: 50,
		right: 10,
		top: 10,
		bottom: 50
	};

	w = outerW - margin.left - margin.right;
	h = outerH - margin.top - margin.bottom;

  const xExtent = data.map(d => d[xAccessor]);
  
	const max = d3.max(data, d => d.total);

	x = d3.scaleBand().rangeRound([0, w]).domain(xExtent).padding(0.1);
  y = d3.scaleLinear().rangeRound([h, 0]).domain([0, max]).nice();
  z = d3.scaleOrdinal(d3.schemeCategory10);

	build();
}

export function init() {
	d3.loadData('./assets/data/stackedBar.csv', function(err, res) {
		data = res[0].map(d => {
      yAccessors.map(accessor => {
        d[accessor] = +d[accessor];
      })

      d.total = yAccessors.reduce((accumulator, currentValue) => {
        return d[currentValue] + accumulator;
      }, 0)

			return d;
    })
    
    data.sort((a, b) => a.total - b.total);

    stackedData = d3.stack().keys(yAccessors)(data);

		setup();
	})
}
