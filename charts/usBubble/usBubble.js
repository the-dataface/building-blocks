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

let r,
	fontSize;

let states,
	data,
	projection,
	path;

const rAccessor = 'rVal';

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

	const bubble = g.append('g')
		.attr('class', 'bubble');

	bubble.selectAll('circle')
		.data(topojson.feature(states, states.objects.states).features)
		.enter()
		.append('circle')
		.attr('transform', d => `translate(${path.centroid(d)})`)
		.attr('r', d => r(d.properties[rAccessor]))
		.style('fill-opacity', .6)
		.style('pointer-events', 'none');

	const label = g.append('g')
		.attr('class', 'bubble-label');

	label.selectAll('text')
		.data(topojson.feature(states, states.objects.states).features)
		.enter()
		.append('text')
		.attr('transform', d => `translate(${path.centroid(d)})`)
		.attr('dy', d => fontSize(r(d.properties[rAccessor])) * .4)
		.text(d => d.properties[rAccessor])
		.style('font-size', d => fontSize(r(d.properties[rAccessor])))
		.style('display', function(d) {
			return this.getComputedTextLength() > r(d.properties[rAccessor]) * 2 ? 'none' : 'block';
		})
		// .style('font-size', function(d) {
		// 	return Math.min(r(d.properties[rAccessor]) / 2, ((r(d.properties[rAccessor]) - 8 / this.getComputedTextLength() * 24) / 2)) + 'px';
		// })
		.style('pointer-events', 'none');

}

function mouseover(d) {
	d = d.properties;

	tooltip.style('display', 'block')
		.html(`<h6>${d.name}</h6><br><strong>${rAccessor}:</strong> ${d[rAccessor]}`);

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
		left: 25,
		right: 25,
		top: 0,
		bottom: 0
	};

	w = outerW - margin.left - margin.right;
	h = outerH - margin.top - margin.bottom;

	const rExtent = d3.extent(data, d => d[rAccessor]);

	r = d3.scaleSqrt().domain([0, rExtent[1]]).range([0, 75]);
	fontSize = d3.scaleSqrt().domain(r.range()).range([10, r.range()[1] / 3]);

	//getProjectionParameters();
	build();
}

export function init() {
	d3.loadData('https://cdn.jsdelivr.net/npm/us-atlas@2/us/states-10m.json', './assets/data/usBubble.csv', function(err, res) {
		states = res[0];

		data = res[1].map(d => {
			d[rAccessor] = +d[rAccessor];
			return d;
		});

		data.forEach(d => {
			states.objects.states.geometries.forEach(state => {
				if (state.properties.name === d.name) {
					state.properties[rAccessor] = d[rAccessor];
				}
			})
		});

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