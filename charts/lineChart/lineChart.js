import * as util from "./utilities.js";
import * as globals from './_globals.js';

//---->GLOBAL VARIABLES FOR LINE CHART<-----//
const container = d3.select('.line-container'),
	tooltip = container.select('.tooltip'),
	tooltipW = +tooltip.style('width').replace('px', '');

let svg,
	g;

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
	yAccessor = 'yVal',
	nestAccessor = 'name';

const parseX = d3.timeParse('%Y-%m-%d'),
	formatX = d3.timeFormat('%Y-%m');

function build() {
	container.selectAll('*:not(.tooltip)').remove();

	svg = container.append('svg')
		.attr('width', outerW)
		.attr('height', outerH);

	g = svg.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	const xAXis = d3.axisBottom(x)
		.ticks(4)
		.tickSizeOuter(0)
		.tickFormat(d => formatX(d));

	g.append('g')
		.attr('transform', `translate(0, ${h})`)
		.attr('class', 'x axis')
		.call(xAXis);

	const yAxis = d3.axisLeft(y)
		.tickSizeOuter(0)
		.tickSize(-w);

	g.append('g')
		.attr('class', 'y axis')
		.call(yAxis);

	// Create voronoi group
	const gVoronoi = g.append('g')
		.attr('class', 'voronoi');

	const voronoi = d3.voronoi()
		.x(d => x(d[xAccessor]))
		.y(d => y(d[yAccessor]))
		.extent([
			[0, 0],
			[w, h]
		]);

	gVoronoi.selectAll('.voronoi-path')
		.data(voronoi.polygons(d3.merge(nested.map(function(d) {
			return d.values;
		}))))
		.enter().append('path').attr('class', 'voronoi-path')
		.attr('d', d => d ? 'M' + d.join('L') + 'Z' : null)
		.on('mouseover', mouseover)
		.on('mouseout', mouseout);

	g.selectAll('.line-path')
		.data(nested)
		.enter()
		.append('path')
		.attr('class', 'line-path')
		.attr('d', d => line(d.values))
		.attr('fill', 'none')
		.style('stroke-width', 2)
		.style('pointer-events', 'none');
}

function mouseover(d) {
	d = d.data;

	tooltip.style('display', 'block')
		.style('top', margin.top + 'px')
		.style('left', margin.left + 'px')
		.style('transform', util.tooltipPosition(w, margin, x(d[xAccessor]), y(d[yAccessor]), tooltipW))
		.html(`<h6>${d[nestAccessor]}</h6><p><strong>Date</strong>: ${formatX(d[xAccessor])}<br><strong>Value</strong>: ${d[yAccessor]}`);

	g.append('circle')
		.attr('class', 'focus')
		.attr('r', 3)
		.attr('transform', `translate(${x(d[xAccessor])}, ${y(d[yAccessor])})`)
		.style('pointer-events', 'none');
}

function mouseout() {
	tooltip.style('display', 'none')
	g.selectAll('.focus').remove();
}

export function setup() {
	outerW = container.node().offsetWidth;
	outerH = container.node().offsetHeight;

	margin = {
		left: 20,
		right: 15,
		top: 10,
		bottom: 20
	};

	w = outerW - margin.left - margin.right;
	h = outerH - margin.top - margin.bottom;

	const xExtent = d3.extent(data, d => d[xAccessor]),
		yExtent = d3.extent(data, d => d[yAccessor]);

	x = d3.scaleTime().domain(xExtent).range([0, w]);
	y = d3.scaleLinear().domain([0, yExtent[1]]).range([h, 0]);

	line = d3.line()
		.x((d) => x(d[xAccessor]))
		.y((d) => y(d[yAccessor]))
		.curve(d3.curveMonotoneX);

	build();
}

export function init() {
	d3.loadData('./assets/data/lineChart.csv', function(err, res) {
		data = res[0].map(d => {
			d[xAccessor] = parseX(d[xAccessor]);
			d[yAccessor] = +d[yAccessor];
			return d;
		})

		nested = d3.nest()
			.key(d => d[nestAccessor])
			.entries(data);

		setup();
	})
}