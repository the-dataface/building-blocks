import * as util from "./utilities.js";
import * as globals from './_globals.js';

const container = d3.select('.multiple-bar-wrapper'),
	tooltip = container.select('.tooltip'),
	tooltipW = +tooltip.style('width').replace('px', '');

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

function build() {
	container.selectAll('*:not(.tooltip)').remove();

	const containers = container.selectAll('.multiple-bar-container')
		.data(nested)
		.enter()
		.append('div')
		.attr('class', 'multiple-bar-container');

	containers.append('p')
		.text(d => d.key)
		.style('margin', 0);

	svgs = containers.append('svg')
		.attr('width', outerW)
		.attr('height', outerH);

	gs = svgs.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	const xAXis = d3.axisBottom(x)
		.tickSizeOuter(0)
		.tickSize(0)
		.tickPadding(5)

	gs.append('g')
		.attr('transform', `translate(0, ${h})`)
		.attr('class', 'x axis')
		.call(xAXis);

	const yAxis = d3.axisLeft(y)
		.tickSizeOuter(0)
		.ticks(5)
		.tickSize(-w);

	gs.append('g')
		.attr('class', 'y axis')
		.call(yAxis);

	const bar = gs.selectAll('.bar')
		.data(d => d.values)
		.enter().append('g')
		.attr('class', 'bar');

	bar.append('rect')
		.attr('x', d => x(d[xAccessor]))
		.attr('y', d => y(d[yAccessor]))
		.attr('width', x.bandwidth())
		.attr('height', d => h - y(d[yAccessor]))
		.on('mousemove', mousemove)
		.on('mouseout', mouseout);

}

function mousemove(d) {
	const xPos = d3.mouse(container.node())[0] - w,
		yPos = d3.mouse(container.node())[1];

	tooltip.style('display', 'block')
		.style('transform', util.tooltipPosition(w, margin, xPos, yPos, tooltipW))
		.html(`<h6>${d[xAccessor]}</h6><p><strong>Value</strong>: ${d[yAccessor]}`);
}

function mouseout() {
	tooltip.style('display', 'none');
}


export function setup() {
	let inrow = 4;
	if ($('.multiple-bar-wrapper').width() / 220 < inrow) inrow = Math.floor($('.multiple-bar-wrapper').width() / 220);
	outerW = ($('.multiple-bar-wrapper').width() / inrow) - 20;
	if (outerW < 200) outerW = 200;

	outerH = 170;

	margin = {
		left: 20,
		right: 15,
		top: 10,
		bottom: 20
	};

	w = outerW - margin.left - margin.right;
	h = outerH - margin.top - margin.bottom;

	const max = d3.max(data, d => d[yAccessor]);
	const xExtent = data.map(d => d[xAccessor]);

	y = d3.scaleLinear().rangeRound([h, 0]).domain([0, max]).nice();
	x = d3.scaleBand().rangeRound([0, w]).domain(xExtent).padding(0.1);

	build();
}

export function init() {
	d3.loadData('./assets/data/smallMultipleBarChart.csv', function(err, res) {
		data = res[0].map(d => {
			d[yAccessor] = +d[yAccessor];
			return d;
		})

		nested = d3.nest()
			.key(d => d.name)
			.entries(data);

		setup();
	})
}