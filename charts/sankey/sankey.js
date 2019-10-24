import * as util from "./utilities.js";
import * as globals from './_globals.js';
import { sankey as sankeyGraph} from 'd3-sankey';
import { sankeyLinkHorizontal } from 'd3-sankey';

//---->GLOBAL VARIABLES FOR LINE CHART<-----//
const container = d3.select('.sankey-container');
	//tooltip = container.select('.tooltip'),
	//tooltipW = +tooltip.style('width').replace('px', '');

let svg,
	g;

let outerW,
	outerH,
	margin,
	w,
	h;

let data,
  nested,
  sankeyConstructor,
  sankey,
	x,
	y,
  r;
  
const xAccessor = 'xVal',
	yAccessor = 'yVal',
	nestAccessor = 'name';

const parseX = d3.timeParse('%Y-%m-%d'),
  formatX = d3.timeFormat('%Y-%m');
  
// zero decimal places
const formatNumber = d3.format(',.0f');
const format = d => `${formatNumber(d)}`;

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
const getColor = name => colorScale(name);

function build() {
	container.selectAll('*:not(.tooltip)').remove();

	svg = container.append('svg')
		.attr('width', outerW)
		.attr('height', outerH);

	g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const { nodes, links} = sankey(data);

  svg.append("g")
    .attr("stroke", "#000")
    .selectAll("rect")
    .data(nodes)
    .enter()
    .append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .style("fill", d => getColor(d.name))
    .append("title")
    .text(d => `${d.name}\n${format(d.value)}`)

  const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.5)
    .selectAll("g")
    .data(links)
    .enter()
    .append("g")
    .style("mix-blend-mode", "multiply");

  link.append("path")
    .attr("d", sankeyLinkHorizontal())
    .style("stroke", d => getColor(d.target.name))
    .attr("stroke-width", d => Math.max(1, d.width));

  link.append("title")
    .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

  svg.append("g")
    .style("font", "10px sans-serif")
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("x", d => d.x0 < w / 2 ? d.x1 + 6 : d.x0 - 6)
    .attr("y", d => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => d.x0 < w / 2 ? "start" : "end")
    .text(d => d.name);

  const gradient = link.append("linearGradient")
    .attr("id", (d,i) => {
      const id = `link-${i}`;
      d.uid = `url(#${id})`;
      return id;
    })
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", d => d.source.x1)
    .attr("x2", d => d.target.x0);

  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d => getColor(d.source.name));

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d => getColor(d.target.name));

    link.append("path")
    .attr("d", sankeyLinkHorizontal())
    .style("stroke", d => d.uid)
    .attr("stroke-width", d => Math.max(1, d.width));
}

export function setup() {
	outerW = container.node().offsetWidth;
	outerH = container.node().offsetHeight;

	margin = {
		left: 10,
		right: 10,
		top: 10,
		bottom: 0
	};

	w = outerW - margin.left - margin.right;
  h = outerH - margin.top - margin.bottom;
  
  sankeyConstructor = sankeyGraph()
    //.nodeAlign(d3[`sankey${align[0].toUpperCase()}${align.slice(1)}`])
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[1, 5], [w - 1, h - 5]]);

  sankey = ({nodes, links}) => {
    return sankeyConstructor({
      nodes: nodes.map(d => Object.assign({}, d)),
      links: links.map(d => Object.assign({}, d))
    })
  };

	build();
}

export function init() {
  data = {
    "nodes": [
      {
        "name": "First Thing",
        "id": 0
      },
      {
        "name": "Second Thing",
        "id": 1
      },
      {
        "name": "Third Thing",
        "id": 2
      },
      {
        "name": "Fourth Thing",
        "id": 3
      },
      {
        "name": "Fifth Thing",
        "id": 4
      },
      {
        "name": "Sixth Thing",
        "id": 5
      },
      {
        "name": "Seventh Thing",
        "id": 6
      },
      {
        "name": "Eigth Thing",
        "id": 7
      }
    ],
    "links": [
      {
        "source": 0,
        "target": 4,
        "value": .33333,
        "label": 1
      },
      {
        "source": 2,
        "target": 4,
        "value": 0.33333,
        "label": 0.64
      },    
      {
        "source": 3,
        "target": 4,
        "value": 0.33333,
        "label": 0.36
      },
      {
        "source": 4,
        "target": 5,
        "value": 0.20,
        "label": 0.33
      },
      {
        "source": 4,
        "target": 6,
        "value": 0.70,
        "label": 0.67
      },
      {
        "source": 4,
        "target": 7,
        "value": 0.10,
        "label": 0.16
      },
    ]
  }

  setup();
}
