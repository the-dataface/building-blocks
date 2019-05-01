const container = d3.select('body').append('div').attr('class', 'bar-container');

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

const barH = 20;

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

    const gs = g.selectAll('.bar')
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
        .attr('height', y.bandwidth());

    gs.append('text')
        .attr('text-anchor', 'end')
        .attr('x', d => x(d[xAccessor]) - 3)
        .attr('y', y.bandwidth() / 2)
        .text(d => d[yAccessor]);

}

function setup() {
    outerW = container.node().offsetWidth;
    outerH = data.length * barH;
  
    margin = {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10
    };
  
    w = outerW - margin.left - margin.right;
    h = outerH - margin.top - margin.bottom;
  
    const max = d3.max(data, d => d[xAccessor]);
  
    x = d3.scaleLinear().rangeRound([0, w]).domain([0, max]).nice();
    y = d3.scaleBand().rangeRound([h, 0]).domain([yExtent]).padding(0.1);
    //r = d3.scaleSqrt().rangeRound([]).domain(rExtent).nice();
  
    build();
}

function init() {
    d3.loadData('../assets/data/bar.csv', function(err, res){
        data = res[0].map(d => {
            d.xVal = +d.xVal;
            return d;
        })
        setup();
    })
}

export default { init, resize };