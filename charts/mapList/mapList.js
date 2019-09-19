import * as util from "./utilities.js";
import * as globals from './_globals.js';

const mapcontainer = d3.select('.yelp-map-container'),
	listWrapper = d3.select('.yelp-list-wrapper'),
	listHeader = d3.select('.yelp-list-header'),
	listContainer = d3.select('.yelp-list-container');

let listWrapperWidth,
	listWrapperHeight,
	listHeaderHeight,
	listItemHeight,
	listItemWidth,
	listItemPadding = 5,
	listColumnCount;

let svg,
	g;

let outerW,
	outerH,
	margin,
	w,
	h;

let states,
	cities,
	collections,
	projection,
	path;

let mapCircleRadius = 15,
	currentCity = 'San Francisco';

function build() {
	mapcontainer.selectAll('*:not(.tooltip)').remove();

	svg = mapcontainer.append('svg')
		.attr('width', outerW)
		.attr('height', outerH);

	g = svg.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	g.append('g')
		.attr('class', 'state-lines')
		.selectAll('path')
		.data(states.features)
		.enter()
		.append('path')
		.attr('d', path);

	let city = g.selectAll('g')
		.data(cities)
		.enter()
		.append('g')
		.attr('class', 'yelp-map-city-group')
		.attr('id', d => `yelp-map-city-group-${util.camelize(d.city)}`)
		.attr('transform', d => `translate(${projection([d.longitude, d.latitude])[0]}, ${projection([d.longitude, d.latitude])[1]})`);

	city.append('circle')
		.attr('class', 'yelp-map-city-inner-circle')
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('r', mapCircleRadius);

	city.append('text')
		.attr('class', 'yelp-map-city-inner-rank')
		.attr('x', 0)
		.attr('y', 0)
		.attr('dy', 1)
		.text(d => d.rank);

	city.append('text')
		.attr('class', 'yelp-map-city-label')
		.attr('x', 0)
		.attr('y', 0)
		.attr('dy', globals.get().isDesktop ? 5 : 4)
		.attr('dx', d => d.city === 'Pittsburgh' ? -(mapCircleRadius + 5) : mapCircleRadius + 5)
		.attr('text-anchor', d => d.city === 'Pittsburgh' ? 'end' : 'start')
		.text(d => `${d.city}, ${d.state}`)

	cities.filter(d => d.city === currentCity)
		.forEach(d => buildCity(d.city, d));

	city.on('mouseover', d => {
		if (d.city != currentCity) {
			currentCity = d.city;
			buildCity(d.city, d);
		}
	});

}

export function setup() {
	outerW = mapcontainer.node().offsetWidth;
	outerH = mapcontainer.node().offsetHeight;

	listWrapperWidth = listWrapper.node().offsetWidth;
	listWrapperHeight = listWrapper.node().offsetHeight;

	margin = {
		left: 10,
		right: 10,
		top: 10,
		bottom: 10
	};

	if (globals.get().isTablet) {
		mapCircleRadius = 10;
		listColumnCount = 5;
		listItemHeight = 40;
		listItemWidth = listWrapperWidth / 2 - listItemPadding;
	} else if (globals.get().isMobile) {
		mapCircleRadius = 6;
		listColumnCount = 10;
		listItemHeight = 35;
		listItemWidth = listWrapperWidth;
	} else if (globals.get().isDesktop) {
		mapCircleRadius = 11;
		listColumnCount = 10;
		listItemHeight = 40;
		listItemWidth = listWrapperWidth;
	}

	w = outerW - margin.left - margin.right;
	h = outerH - margin.top - margin.bottom;

	getProjectionParameters();
	build();
}

export function init() {
	d3.queue()
		.defer(d3.tsv, './assets/data/yelp-states.txt')
		.defer(d3.tsv, './assets/data/yelp-cities.txt')
		.defer(d3.tsv, './assets/data/yelp-collections.txt')
		.awaitAll(function(err, res) {
			states = convertToGeoJson(res[0]);
			cities = res[1];
			collections = res[2];

			mapcontainer.transition().style('opacity', 1);

			setup();
		})
}

function buildCity(thiscity, data) {
	let city = d3.select(`#yelp-map-city-group-${util.camelize(thiscity)}`);

	d3.selectAll('.yelp-map-city-inner-circle').transition().duration(500).style('fill', '#d32323')
	d3.selectAll('.yelp-map-city-outer-circle').transition().duration(500).attr('r', 0).style('opacity', 0)
	d3.selectAll('.hover').transition().duration(500).style('opacity', 0).remove();
	city.select('circle').transition().duration(500).style('fill', '#333')

	city.append('circle')
		.attr('class', 'yelp-map-city-outer-circle hover')
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('r', mapCircleRadius)
		.style('stroke', '#333')
		.transition()
		.duration(250)
		.attr('r', mapCircleRadius + 2);

	buildList(data);
}

function buildList(data) {
	let key = data.city + data.state,
		thisCityData = collections.filter(d => (d.city + d.state) == key)

	listContainer.selectAll('div').remove();

	listWrapper.transition().style('display', 'block').duration(1000).style('opacity', 1);

	listHeader.select('h4').text(`${data.rank}. ${data.city}, ${data.state}`);

	listHeaderHeight = listHeader.node().offsetHeight;

	var listItem = listContainer.selectAll('div')
		.data(thisCityData)
		.enter()
		.append('div')
		.attr('class', 'yelp-list-item')
		.style('opacity', 0)
		.style('height', `${listItemHeight}px`)
		.style('left', (d, i) => {
			var finalLeft = Math.floor(i / listColumnCount) * (listItemWidth + listItemPadding);
			return `${finalLeft}px`;
		})
		.style('top', 0)

	var businessName = listItem.append('p');

	businessName.append('a')
		.attr('href', d => `https://www.yelp.com/'${d.url}`)
		.attr('target', '_blank')
		.append('span')
		.attr('class', 'business-name')
		.text(d => d.name)

	var categoryName = listItem.append('p')

	categoryName.append('span')
		.attr('class', 'category-name')
		.text(d => d.category1)

	listItem.transition()
		.duration(500)
		.delay((d, i) => i * 100)
		.style('top', (d, i) => `${(i % listColumnCount) * listItemHeight + (i % listColumnCount) * listItemPadding}px`)
		.style('opacity', 1);
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

function convertToGeoJson(data) {
	var geoJsonOutput = {
		type: 'FeatureCollection',
		features: []
	}

	data.forEach(function(d, i) {

		var polygonType = 'Polygon',
			multiPolygons = ['Alaska', 'Hawaii', 'Maryland', 'Michigan', 'Rhode Island', 'Virginia', 'Washington'];

		if (multiPolygons.includes(d.name)) {
			polygonType = "MultiPolygon"
		}

		var coords = JSON.parse(d.coordinates)

		var featureArray = {
			type: "Feature",
			id: d.id,
			properties: {
				name: d.name
			},
			geometry: {
				type: polygonType,
				coordinates: coords
			}
		}

		geoJsonOutput.features.push(featureArray)
	})

	return geoJsonOutput;
}

function formatCityCoordinates(data) {
	data.forEach(function(d) {
		d.rank = +d.rank,
			d.latitude = +d.latitude,
			d.longitude = +d.longitude
	})

	return data;
}