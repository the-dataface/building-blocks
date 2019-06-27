import * as util from "./utilities.js";
import * as globals from './_globals.js';

const container = d3.select('.bar-container'),
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
	x,
	y;

const xAccessor = 'name',
	yAccessor = 'yVal';

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

	gs = g.selectAll('.bar')
		.data(data)
		.enter()
		.append('g')
		.attr('class', 'bar')
		.attr('transform', d => `translate(${x(d[xAccessor])}, 0)`);

	gs.append('rect')
		.attr('x', 0)
		.attr('y', d => y(d[yAccessor]))
		.attr('width', d => x.bandwidth())
		.attr('height', d => h - y(d[yAccessor]))
		.on('mousemove', mousemove)
		.on('mouseout', mouseout);

	gs.append('text')
		.attr('text-anchor', 'middle')
		.attr('x', x.bandwidth() / 2)
		.attr('y', d => y(d[yAccessor]))
		.attr('dy', 16)
		.text(d => d[yAccessor])
		.style('pointer-events', 'none');
}

function mousemove(d) {

	const xPos = d3.mouse(svg.node())[0],
		yPos = d3.mouse(svg.node())[1];

	tooltip.style('display', 'block')
		.style('transform', util.tooltipPosition(w, margin, xPos, yPos, tooltipW))
		.html(`<h6>${d[xAccessor]}</h6><p><strong>y</strong>: ${d[yAccessor]}`);
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
	const max = d3.max(data, d => d[yAccessor]);

	x = d3.scaleBand().rangeRound([0, w]).domain(xExtent).padding(0.1);
	y = d3.scaleLinear().rangeRound([h, 0]).domain([0, max]).nice();
	//r = d3.scaleSqrt().rangeRound([]).domain(rExtent).nice();

	build();
}

export function init() {
	d3.loadData('./assets/data/verticalBarChart.csv', function(err, res) {
		data = res[0].map(d => {
			d[yAccessor] = +d[yAccessor];
			return d;
		})
		data.sort((a, b) => a[yAccessor] - b[yAccessor]);

		setup();
	})
}

// export default {
//   init
// };