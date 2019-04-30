//---->GLOBAL VARIABLES FOR US COUNTY<-----//
const container = d3.select('body').append('div').attr('class', 'map-container');
    
let svg,
    g;

let outerW,
    outerH, 
    margin,
    w,
    h;

let counties,
    countiesMesh,
    projection,
    path;

function build() {
    // Set up containers
    container.selectAll('*').remove();

    svg = container.append('svg')
        .attr('width', outerW)
        .attr('height', outerH);

    g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    g.selectAll('path')
        .data(counties.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .on('mouseover', d => console.log('hi'))

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

  projection = d3.geoAlbersUsa()
    .scale(1)
    .translate([0, 0]);
  
  path = d3.geoPath()
      .projection(projection);

  const parameters = getProjectionParameters();

  projection
      .scale(parameters[0])
      .translate(parameters[1]);

  build();
}

function init() {
    d3.loadData('../assets/data/usCounty.json', function(err, res){
        const topo = res[0];
        counties = topojson.feature(topo, topo.objects.counties);
        countiesMesh = topojson.mesh(topo, topo.objects.counties);
        setup();
    })
}

function getProjectionParameters() {
    b = path.bounds(counties),
    s = .95 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h),
    t = [(w - s * (b[1][0] + b[0][0])) / 2, (h - s * (b[1][1] + b[0][1])) / 2];

    return [s, t];
}

export default {init};