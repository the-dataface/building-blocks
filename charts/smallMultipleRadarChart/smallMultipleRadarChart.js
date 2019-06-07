import * as util from "./utilities.js";
import * as globals from './_globals.js';

const container = d3.select('.multiple-radar-wrapper'),
	tooltip = container.select('.tooltip'),
	tooltipW = +tooltip.style('width').replace('px', '');

let svgs,
	gs;

let inrow,
	outerW,
	outerH,
	margin,
	w,
	h;

let data,
	dataLength,
	nested,
	line,
	x,
	y,
	r;

// what should we nest by?
const groupBy = 'name';

// curved line?
const curved = true;

// number of segments for axes and how far to rotate
const segments = 5,
	segmentRotate = (360 / segments) / 2;

const valAccessor = 'val',
	xAccessor = 'category';

function build() {
	container.selectAll('*:not(.tooltip)').remove();

	const containers = container.selectAll('.multiple-radar-container')
		.data(nested)
		.enter()
		.append('div')
		.attr('class', 'multiple-radar-container');

	containers.append('p')
		.attr('class', 'radar-header')
		.text(d => d.key)
		.style('margin', 0);

	svgs = containers.append('svg')
		.attr('width', outerW)
		.attr('height', outerH);

	gs = svgs.append('g')
		.attr('transform', d => `translate(${margin.left + (w/2)}, ${margin.top + (h/2)})`);

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

	gs.append('g')
		.attr('class', 'axis')
		.selectAll('line')
		.data(d3.range(0, 360, (360 / segments)))
		.enter().append('line')
		.attr('y2', -(w / 2) + 3)
		.attr('transform', (d, i) => `rotate(${(i*360 / d3.range(0,360,(360/segments)).length) + segmentRotate})`);

	// Create voronoi group
	const gVoronoi = svgs.append('g')
		.attr('class', 'voronoi')
		.attr('transform', d => `translate(${margin.left + (w/2)}, ${margin.top + (h/2)})`);

	const voronoi = d3.voronoi()
		.x((d, i) => r(d[valAccessor]) * Math.cos((Math.PI * 2 / dataLength) * i - Math.PI / 2))
		.y((d, i) => r(d[valAccessor]) * Math.sin((Math.PI * 2 / dataLength) * i - Math.PI / 2))
		.extent([
			[-w / 2, -h / 2],
			[w / 2, h / 2]
		]);

	gVoronoi.selectAll('.voronoi-path')
		.data(d => voronoi(d.values).polygons())
		.enter().append('path').attr('class', 'voronoi-path')
		.attr('d', d => d ? 'M' + d.join('L') + 'Z' : null)
		.on('mouseover', mouseover)
		.on('mouseout', mouseout);

	gs.append('path')
		.attr('class', 'radar-fill')
		.attr('d', d => line(d.values))
		.style('pointer-events', 'none');

	gs.append('path')
		.attr('class', 'radar-stroke')
		.attr('d', d => line(d.values))
		.style('pointer-events', 'none');

	gs.selectAll('.radar-point')
		.data(d => d.values)
		.enter().append('circle')
		.attr('class', 'radar-point')
		.attr('r', 3)
		.attr('cx', (d, i) => r(d[valAccessor]) * Math.cos((Math.PI * 2 / dataLength) * i - Math.PI / 2))
		.attr('cy', (d, i) => r(d[valAccessor]) * Math.sin((Math.PI * 2 / dataLength) * i - Math.PI / 2))
		.style('pointer-events', 'none');
}

function mouseover(d, i) {
	d = d.data;

	let index = d.index + 1;
	let row = Math.floor(index / inrow)

	if (index > inrow) index = index - inrow;
	if (index === inrow) row -= 1;

	tooltip.style('display', 'block')
		.style('top', (margin.top + (w / 2) + row * (h + 40 + $('.radar-header').height())) + 'px')
		.style('left', (margin.left + (h / 2) + (index - 1) * (w + 40)) + 'px')
		.style('transform', util.tooltipPosition(w, margin, r(d[valAccessor]) * Math.cos((Math.PI * 2 / dataLength) * i - Math.PI / 2), r(d[valAccessor]) * Math.sin((Math.PI * 2 / dataLength) * i - Math.PI / 2), tooltipW))
		.html(`<h6>${d.name}</h6><p><strong>x</strong>: ${d[xAccessor]}<br><strong>y</strong>: ${d[valAccessor].toFixed(2)}`);
}

function mouseout() {
	tooltip.style('display', 'none');
}

export function setup() {
	inrow = 4;
	if ($('.multiple-radar-wrapper').width() / 220 < inrow) inrow = Math.floor($('.multiple-radar-wrapper').width() / 220);
	outerW = ($('.multiple-radar-wrapper').width() / inrow) - 20;
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

	line = d3.radialLine()
		.curve(d3.curveLinearClosed)
		.radius(d => r(d[valAccessor]))
		.angle((d, i) => i * (Math.PI * 2 / dataLength));

	if (curved) line.curve(d3.curveCardinalClosed);

	build();
}

export function init() {
	d3.loadData('./assets/data/smallMultipleRadarChart.csv', function(err, res) {
		data = res[0].map(d => {
			d[valAccessor] = +d[valAccessor];
			return d;
		})

		nested = d3.nest()
			.key(d => d[groupBy])
			.entries(data);

		nested.forEach((d, i) => {
			d.values.forEach(d => {
				d.index = i;
			})
		})

		dataLength = nested[0].values.length;

		setup();
	})
}