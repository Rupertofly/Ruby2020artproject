import PointGraph from './PointGraph';
import CellPoint from './CellPoint';
import * as d from 'd3-delaunay';
enum colours {
    red = 'rgb(245, 106, 104)',
    blue = 'rgb(88, 181, 222)',
    purple = 'rgb(180, 116, 238)'
}
type celltype = undefined | 'red' | 'blue';
const canvas = document.getElementById(`canvas`) as HTMLCanvasElement;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext(`2d`);
const graph = new PointGraph(canvas.width, canvas.height, 1000);

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

function render() {
    // graph.forceSim.alpha() > 0.1 && console.time('x');
    graph.forceSim.tick();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = `white`;
    graph.runV();
    const voronoiGraph = graph.currentDiagram;
    const unVisited = voronoiGraph.cells.filter(
        p => p.site.data.type !== undefined
    );
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
