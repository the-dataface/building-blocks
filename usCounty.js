//---->GLOBAL VARIABLES FOR SCATTER PLOT<-----//
const container = d3.select('body').append('div').attr('class', 'map-container');
    
let svg,
    g;

let outerW,
    outerH, 
    margin,
    w,
    h;

let counties,
    path;

function build() {
    // Set up containers
    container.selectAll('*').remove();

    svg = container.append('svg');

    svg.append('g')
        .attr('class', 'counties')
        .selectAll('path')
        .data(counties)
        .enter()
        .append('path')
        .attr('d', path);

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

  path = d3.geoPath();

  build();
}

function init() {
    d3.loadData('../assets/data/usCounty.json', function(err, res){
        const topo = res[0];
        counties = topojson.feature(topo, topo.objects.counties).features;
        setup();
    })
}

export default {init};
