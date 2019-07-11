import * as util from "./utilities.js";
import * as globals from './_globals.js';

const container = d3.select('.arrow-chart-container'),
	tooltip = container.select('.tooltip'),
	tooltipW = +tooltip.style('width').replace('px', '');

let svg,
	g,
	gs;

let outerW,
	outerH,
	margin,
	w,
	h;

let data,
	nested,
	x,
	y;

const xAccessor = 'xVal',
	yAccessor = 'name',
	nestAccessor = 'name';

const start = 2012,
	end = 2019;

const bandH = 10,
	r = 2;

const arrowHeight = 4,
	mapTriangleSize = 20;

const triangle = d3.symbol()
	.type(d3.symbolTriangle)
	.size(mapTriangleSize)

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
		.call(d3.axisTop(x)
			.tickSizeOuter(0)
			.tickPadding(10)
			.tickSize(-h)
		);

	gs = g.selectAll('.arrow')
		.data(nested)
		.enter()
		.append('g')
		.attr('class', 'arrow')
		.attr('transform', d => `translate(0, ${y(d.key)})`);

	gs.append('circle')
		.attr('cx', d => x(d.start))
		.attr('cy', bandH / 2)
		.attr('r', r)
		.style('fill', d => d.diff < 0 ? '#FF1000' : '#3ACBFF');

	gs.append('rect')
		.attr('x', d => d.diff >= 0 ? x(d.start) : x(d.end))
		.attr('y', bandH / 2 - 1)
		.attr('width', d => d.diff >= 0 ? (x(d.end) - x(d.start)) : (x(d.start) - x(d.end)))
		.attr('height', 2)
		.style('fill', d => d.diff < 0 ? '#FF1000' : '#3ACBFF');

	gs.append('path')
		.attr('class', 'triangle')
		.attr('d', triangle)
		.attr('transform', d => getTriangleTransform(d))
		.style('stroke', d => d.diff < 0 ? '#FF1000' : '#3ACBFF')
		.style('fill', d => d.diff < 0 ? '#FF1000' : '#3ACBFF')


	gs.append('text')
		.attr('class', 'arrow-label')
		.attr('x', d => x(d.start))
		.attr('y', bandH / 2)
		.attr('dx', d => d.diff >= 0 ? -4 : 4)
		.attr('dy', 3)
		.style('text-anchor', d => d.diff >= 0 ? 'end' : 'start')
		.text(d => d.key)
}

function mousemove(d) {

	const xPos = d3.mouse(svg.node())[0],
		yPos = d3.mouse(svg.node())[1];

	tooltip.style('display', 'block')
		.style('transform', util.tooltipPosition(w, margin, xPos, yPos, tooltipW))
		.html(`<h6>${d[yAccessor]}</h6><p><strong>x</strong>: ${d[xAccessor]}`);
}

function mouseout() {
	tooltip.style('display', 'none');
}

export function setup() {
	outerW = container.node().offsetWidth;

	margin = {
		left: 100,
		right: 10,
		top: 30,
		bottom: 10
	};

	w = outerW - margin.left - margin.right;
	h = bandH * nested.length;

	outerH = h + margin.top + margin.bottom;

	const xExtent = d3.extent(data, d => d[xAccessor]);
	const yExtent = nested.map(d => d.key);

	x = d3.scaleLinear().rangeRound([0, w]).domain(xExtent).nice();
	y = d3.scaleBand().rangeRound([0, h]).domain(yExtent).padding(0);

	build();
}

export function init() {
	d3.loadData('./assets/data/arrowChart.csv', function(err, res) {
		data = res[0].map(d => {
			d[xAccessor] = +d[xAccessor];
			return d;
		})

		nested = d3.nest()
			.key(d => d[nestAccessor])
			.entries(data);

		nested.forEach(d => {
			d.start = d.values.filter(d => d.year == start)[0][xAccessor];
			d.end = d.values.filter(d => d.year == end)[0][xAccessor];
			d.diff = d.end - d.start;
		});

		// nested.sort((a, b) => d3.descending(a.diff, b.diff));

		setup();
	})
}

function getTriangleTransform(d) {
	let xMove = x(d.end),
		yMove = bandH / 2,
		rotate = d.diff >= 0 ? 'rotate(90)' : 'rotate(270)';

	return `translate(${xMove}, ${yMove}) ${rotate}`;
}