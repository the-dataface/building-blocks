//---->GLOBAL VARIABLES FOR SCATTER PLOT<-----//
const container = d3.select('main').append('section').append('div').attr('class', 'scatter-container');

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
  yAccessor = 'yVal';
//rAccessor

function build() {
  // Set up containers
  container.selectAll('*').remove();

  svg = container.append('svg')
    .attr('width', outerW)
    .attr('height', outerH);

  g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Create voronoi group
  const gVoronoi = g.append('g')
    .attr('class', 'voronoi');

  const voronoi = d3.voronoi()
    .x(function(d) {
      return x(d[xAccessor]);
    })
    .y(function(d) {
      return y(d[yAccessor]);
    })
    .extent([
      [0, 0],
      [w, h]
    ]);

  gVoronoi.selectAll('.voronoi-path')
    .data(voronoi(data).polygons())
    .enter().append('path').attr('class', 'voronoi-path')
    .attr('d', d => d ? 'M' + d.join('L') + 'Z' : null)
    .style('fill', 'rgba(0,0,0,0)');

  // Add axes
  const xAxis = g.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${h})`)
    .call(d3.axisBottom(x)
      .tickSize(-h)
      .tickSizeOuter(0)
      .tickPadding(10)
    );

  const yAxis = g.append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(y)
      .tickSize(-w)
      .tickSizeOuter(0)
      .tickPadding(5)
    );

  // Add scatter dots
  const dots = g.selectAll('.scatter-dot')
    .data(data, d => d.key);

  dots.enter().append('circle')
    .attr('class', d => 'scatter-dot')
    .attr('cx', d => x(d[xAccessor]))
    .attr('cy', d => y(d[yAccessor]))
    //.attr('r', d => r(d[rAccessor]))
    .attr('r', 3)
    .style('fill', 'blue');

  dots.merge(dots)
    .attr('cx', d => x(d[xAccessor]))
    .attr('cy', d => y(d[yAccessor]))
    .transition()
    //.attr('r', d => r(d[rAccessor]))
    .attr('r', 3);

  dots.exit().remove();
}

function setup() {
  outerW = container.node().offsetWidth;
  outerH = container.node().offsetHeight;

  margin = {
    left: 70,
    right: 50,
    top: 30,
    bottom: 50
  };

  w = outerW - margin.left - margin.right;
  h = outerH - margin.top - margin.bottom;

  const xExtent = d3.extent(data, d => d[xAccessor]);
  const yExtent = d3.extent(data, d => d[yAccessor]);
  //rExtent = d3.extent(data, d => d[rAccessor]);

  x = d3.scaleLinear().rangeRound([0, w]).domain(xExtent).nice();
  y = d3.scaleLinear().rangeRound([h, 0]).domain(yExtent).nice();
  //r = d3.scaleSqrt().rangeRound([]).domain(rExtent).nice();

  build();
}

function init() {
  d3.loadData('../assets/data/scatter.csv', function(err, res) {
    data = res[0].map(d => {
      d.xVal = +d.xVal;
      d.yVal = +d.yVal;
      return d;
    })
    setup();
  })
}

export default {
  init
};