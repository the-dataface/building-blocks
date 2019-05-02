const scrollama = require('scrollama');

// using d3 for convenience
// const html = "<figure><p>0</p></figure><article><div class='step' data-step='1'><p>STEP 1</p></div><div class='step' data-step='2'><p>STEP 2</p></div><div class='step' data-step='3'> <p>STEP 3</p></div><div class='step' data-step='4'><p>STEP 4</p></div></article>";
// const scrolly = d3.select('body').append('section').attr('id', 'scrolly').html(html);
const scrolly = d3.select('#scrolly');
const figure = scrolly.select('figure');
const article = scrolly.select('article');
const step = article.selectAll('.step');
// initialize the scrollama
const scroller = scrollama();
// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  const stepH = Math.floor(window.innerHeight * 0.85);
  step.style('height', stepH + 'px');
  const figureHeight = window.innerHeight;
  figure
    .style('height', figureHeight + 'px');
  // 3. tell scrollama to update new element dimensions
  scroller.resize();
}
// scrollama event handlers
function handleStepEnter(response) {
  // response = { element, direction, index }
  // add color to current step only
  step.classed('is-active', function(d, i) {
    return i === response.index;
  })
  // update graphic based on step
  figure.select('p').text(response.index + 1);
}

function setupStickyfill() {
  d3.selectAll('.sticky').each(function() {
    Stickyfill.add(this);
  });
}

function init() {
  setupStickyfill();
  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();
  // 2. setup the scroller passing options
  // 		this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller.setup({
      step: '#scrolly article .step',
      offset: 0.5,
      debug: true,
    })
    .onStepEnter(handleStepEnter)
  // setup resize event
  window.addEventListener('resize', handleResize);
}

export default {
  init
};