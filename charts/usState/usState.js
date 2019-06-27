import * as util from "./utilities.js";
import * as globals from './_globals.js';
const topojson = require("topojson");

//---->GLOBAL VARIABLES FOR US STATE<-----//
const container = d3.select('.map-container'),
	tooltip = container.select('.tooltip'),
	tooltipW = +tooltip.style('width').replace('px', '');

let svg,
	g;

let outerW,
	outerH,
	margin,
	w,
	h;

let states,
	projection,
	path;

function build() {
	// Set up containers
	container.selectAll('*:not(.tooltip)').remove();

	svg = container.append('svg')
		.attr("viewBox", "0 0 960 600")
		.style("width", "100%")
		.style("height", "auto");

	g = svg.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	path = d3.geoPath();

	g.append("g")
		.attr('class', 'state-lines')
		.selectAll('path')
		.data(topojson.feature(states, states.objects.states).features)
		.enter()
		.append('path')
		.attr("d", path)
		.attr("stroke-linejoin", "round")
		.on('mouseover', mouseover)
		.on('mousemove', mousemove)
		.on('mouseout', mouseout);

	g.append("path")
		.datum(topojson.feature(states, states.objects.nation, (a, b) => a !== b))
		// .attr("fill", "none")
		// .attr("stroke", "grey")
		.attr('stroke-width', 1)
		.attr("stroke-linejoin", "round")
		.attr("d", path);

}

function mouseover(d) {
	d = d.properties;
	console.log(d);

	tooltip.style('display', 'block')
		.html(`<h6>${d.name}</h6>`);

	mousemove();
}

function mousemove() {
	const x = d3.mouse(svg.node())[0],
		y = d3.mouse(svg.node())[1];

	tooltip.style('transform', util.tooltipPosition(w, margin, x, y, tooltipW))
}

function mouseout() {
	tooltip.style('display', 'none')
}

export function setup() {
	outerW = container.node().offsetWidth;
	outerH = container.node().offsetHeight;

	margin = {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	};

	w = outerW - margin.left - margin.right;
	h = outerH - margin.top - margin.bottom;

	//getProjectionParameters();
	build();
}

export function init() {
	d3.loadData('https://cdn.jsdelivr.net/npm/us-atlas@2/us/states-10m.json', function(err, res) {
		states = res[0];
		setup();
	})
}

function getProjectionParameters() {
	projection = d3.geoAlbersUsa()
		.scale(1)
		.translate([0, 0]);

	path = d3.geoPath()
		.projection(projection);

	const b = path.bounds(states),
		s = .95 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h),
		t = [(w - s * (b[1][0] + b[0][0])) / 2, (h - s * (b[1][1] + b[0][1])) / 2];

	projection
		.scale(s)
		.translate(t);
}

// export default {
//   init
// };