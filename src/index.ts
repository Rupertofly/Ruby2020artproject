import PointGraph from './PointGraph';
import { escapeLeadingUnderscores } from 'typescript';
import CellPoint from './CellPoint';
const graph = new PointGraph(500, 500, 500);
enum colours {
  red = 'rgb(245, 106, 104)',
  blue = 'rgb(88, 181, 222)',
  purple = 'rgb(180, 116, 238)'
}
type celltype = null | 'red' | 'blue';
const canvas = document.getElementById(`canvas`) as HTMLCanvasElement;
const context = canvas.getContext(`2d`);

function drawPolygon(polygon: [number, number][]) {
  context.moveTo(...polygon[1]);
  context.beginPath();
  for (let i = 1; i < polygon.length; i++) {
    context.lineTo(...polygon[i]);
  }
  context.closePath();
}
function constrain(val: number, min: number, max: number) {
  return val < min ? min : val > max ? max : val;
}
type pt = [number, number];
function samePoint(a: pt, b: pt) {
  return a[0] === b[0] && a[1] === b[1];
}
console.log('bary');

function render() {
  graph.forceSim.tick();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = `white`;
  graph.runV().groupCells();
  const voronoiGraph = graph.voronoiFunction(graph.forceSim.nodes());
  const unVisited = voronoiGraph.cells.filter(p => p.site.data.type !== null);
  const groups: { [type: string]: CellPoint[] } = {
    red: [] as CellPoint[],
    blue: [] as CellPoint[]
  };
  while (unVisited.length) {
    const starter = unVisited.shift();
  }
  voronoiGraph.edges.map(edge => {
    if (edge.left?.data.type != edge.right?.data.type) {
      if (!edge.left || !edge.right) return;
      context.strokeStyle =
        colours[
          edge.left.data.type
            ? edge.right.data.type
              ? 'purple'
              : edge.left.data.type
            : edge.right.data.type
        ];
      context.beginPath();
      context.moveTo(...edge[0]);
      context.lineTo(...edge[1]);
      context.stroke();
    } else {
    }
  });
  voronoiGraph.cells.forEach(c => {
    context.fillStyle = colours[c.site.data.type] ?? 'rgb(250, 250, 250)';
    context.beginPath();
    context.ellipse(c.site[0], c.site[1], 5, 5, 0, 0, Math.PI * 2);
    context.fill();
  });
  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);
