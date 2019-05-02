//---->GLOBAL VARIABLES FOR BEESWARM<-----//
const container = d3.select('.beeswarm-container');

let svg,
  g;

let outerW,
  outerH,
  margin,
  w,
  h;

let data,
  x,
  y,
  r;

const xAccessor = 'xVal',
    rAccessor = 'rVal';

function build() {
    // Set up containers
    container.selectAll('*').remove();

    svg = container.append('svg')
        .attr('width', outerW)
        .attr('height', outerH);

    g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const simulation = d3.forceSimulation(data)
        .force("x", d3.forceX(d => x(d[xAccessor])))
        .force("y", d3.forceY(h / 2).strength(1))
        .force("collide", d3.forceCollide(d => r(d[rAccessor]) * 1.05))
        .stop();

    for (let i = 0; i < 200; ++i) simulation.tick();

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
        .data(voronoi(data).polygons())
        .enter().append('path').attr('class', 'voronoi-path')
        .attr('d', d => d ? 'M' + d.join('L') + 'Z' : null)
        .style('fill', 'rgba(0,0,0,0)');

    //Create circles
    const dots = g.selectAll('.swarm-dot')
        .data(data, d => d.key)
        .enter()
        .append('circle')
        .attr('class', 'swarm-dot')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => r(d[rAccessor]))
        .style('fill', '#2d4b5c');

}

function setup() {
  outerW = container.node().offsetWidth;
  outerH = container.node().offsetHeight;

  margin = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10
  };

  w = outerW - margin.left - margin.right;
  h = outerH - margin.top - margin.bottom;

  const xExtent = d3.extent(data, d => d[xAccessor]);
  const rExtent = d3.extent(data, d => d[rAccessor]);

  x = d3.scaleLinear().rangeRound([0, w]).domain(xExtent).nice();
  r = d3.scaleSqrt().rangeRound([2, 10]).domain(rExtent).nice();

  build();
}

function init() {
  d3.loadData('../assets/data/beeswarm.csv', function(err, res) {
    data = res[0].map(d => {
      d.xVal = +d.xVal;
      return d;
    })
    setup();
  })
}

export default {
  init
};