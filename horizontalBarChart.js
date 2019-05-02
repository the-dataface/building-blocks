// const container = d3.select('main').append('section').append('div').attr('class', 'wrapper').append('div').attr('class', 'chart-wide bar-container');

const container = d3.select('.bar-container');

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

const xAccessor = 'xVal',
  yAccessor = 'name';

const barH = 30;

function build() {
  container.selectAll('*').remove();

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
    );

  const yAxis = g.append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(y)
      .tickSize(-w)
      .tickSizeOuter(0)
      .tickPadding(5)
    );

  gs = g.selectAll('.bar')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'bar')
    .attr('transform', d => `translate(0, ${y(d[yAccessor])})`);

  gs.append('rect')
    .attr('x', x(0))
    .attr('y', 0)
    //is this right?
    .attr('width', d => x(d[xAccessor]) - x(0))
    .attr('height', y.bandwidth())
    .attr('fill', '#2d4b5c');

  gs.append('text')
    .attr('text-anchor', 'end')
    .attr('x', d => x(d[xAccessor]) - 5)
    .attr('y', y.bandwidth() / 2)
    .attr('dy', 4)
    .text(d => d[yAccessor]);

}

function setup() {
  outerW = container.node().offsetWidth;
  outerH = data.length * barH;

  margin = {
    left: 100,
    right: 10,
    top: 30,
    bottom: 10
  };

  w = outerW - margin.left - margin.right;
  h = outerH - margin.top - margin.bottom;

  const max = d3.max(data, d => d[xAccessor]);
  const yExtent = data.map(d => d.name);

  x = d3.scaleLinear().rangeRound([0, w]).domain([0, max]).nice();
  y = d3.scaleBand().rangeRound([h, 0]).domain(yExtent).padding(0.1);
  //r = d3.scaleSqrt().rangeRound([]).domain(rExtent).nice();

  build();
}

function init() {
  d3.loadData('../assets/data/horizontalBarChart.csv', function(err, res) {
    data = res[0].map(d => {
      d.xVal = +d.xVal;
      return d;
    })
    data.sort((a, b) => a[xAccessor] - b[xAccessor]);

    setup();
  })
}

export default {
  init
};