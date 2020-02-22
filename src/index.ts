import PointGraph from './PointGraph';
const graph = new PointGraph(500,500,500);

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');

function drawPolygon(polygon:[number,number][]) {
  context.moveTo(...polygon[1]);
  context.beginPath();
  for (let i = 1; i < polygon.length; i++) {
    context.lineTo(...polygon[i])
  }
  context.closePath();
  
}
function constrain(val:number,min:number,max:number) {
  return val < min ? min : val > max ? max : val
}
type pt = [number,number]
function samePoint(a:pt,b:pt) {
  return a[0] === b[0] && a[1] === b[1];
}

function render() {
  
  graph.forceSim.tick();
  context.clearRect(0,0,canvas.width,canvas.height)
  context.strokeStyle = 'white';
  const voronoiGraph = graph.voronoiFunction(graph.forceSim.nodes());
  voronoiGraph.edges.map(edge => {
    if (edge.left?.data.type != edge.right?.data.type) {
      context.strokeStyle = 'red'
      context.beginPath();
      context.moveTo(...edge[0])
      context.lineTo(...edge[1])
      context.stroke();
    } else {
    }
  })
  window.requestAnimationFrame(render);
}
render();
