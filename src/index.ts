import PointGraph from './PointGraph';
import CellPoint from './CellPoint';
import * as d from 'd3-delaunay';
import GD from './GraphDiagram';
import { sample } from 'lodash';

import { range, polygonCentroid } from 'd3';
enum colours {
    red = 'rgb(245, 106, 104)',
    blue = 'rgb(88, 181, 222)',
    purple = 'rgb(180, 116, 238)'
}
type celltype = undefined | 'red' | 'blue';
const canvas = document.getElementById(`canvas`) as HTMLCanvasElement;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const drawingContext = canvas.getContext(`2d`);
const graph = new PointGraph(canvas.width, canvas.height, 1000);
const TYPES = ['a', 'b', ''];
const myPoints = range(4000).map(i => ({
    x: Math.random() * graph.width,
    y: Math.random() * graph.height,
    type: sample(TYPES)
}));
const edges = new GD([1, 1, 720, 720], myPoints, 5);

function drawPath(
    path: Array<pt | number[]>,
    context: CanvasRenderingContext2D,
    close = true
) {
    context.moveTo(...(path[0] as pt));
    path.slice(1).forEach(([x, y]) => context.lineTo(x, y));
    if (close) context.closePath();
}
console.log(edges);
drawingContext.strokeStyle = 'black';
drawingContext.lineWidth = 1;
drawingContext.fillStyle = 'red';
edges.edges().map(edge => {
    // if (edge[0][0] > 300 || edge[1][0] > 300) console.log(edge);
    if (!edge.left || !edge.right) return;
    if (edge.left.type === edge.left.type) return;
    drawingContext.beginPath();

    drawPath(edge, drawingContext, false);
    drawingContext.stroke();
    drawingContext.strokeStyle = 'green';
    drawingContext.beginPath();
    drawingContext.moveTo(...edge[0]);
    if (edge.left) drawingContext.lineTo(edge.left.x, edge.left.y);
    drawingContext.stroke();
    drawingContext.fillStyle = 'yellow';
    // if (edge.right) context.fillRect(edge.right.x, edge.right.y, 2, 2);
});
drawingContext.fillStyle = 'blue';
// for (let i = 0; i < edges.voronoiGraph.delaunay.points.length; i += 2) {
//     const x = edges.voronoiGraph.delaunay.points[i];
//     const y = edges.voronoiGraph.delaunay.points[i + 1];

//     context.fillRect(x, y, 2, 2);
// }

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
    drawingContext.clearRect(0, 0, canvas.width, canvas.height);
    drawingContext.strokeStyle = `black`;
    drawingContext.lineWidth = 2;
    graph.runVoronoi();
    edges.updatePoints(myPoints);
    // myPoints.map((p, i) => {
    //     const [cx, cy] = polygonCentroid(edges.polygon(i));

    //     (p.x = cx), (p.y = cy);
    // });
    const voronoiGraph = graph.currentDiagram;
    const len = (a: pt) => {
        return Math.sqrt(a[0] ** 2 + a[1] ** 2);
    };
    const norm = (a: pt, sz: number) => {
        const l = len(a);

        return [(a[0] / l) * sz, (a[1] / l) * sz] as pt;
    };
    const eg = voronoiGraph.edges();
    const gp = graph.getRegionHulls();

    gp.forEach((v, k) => {
        drawingContext.fillStyle = k;
        v.forEach((edges, gp) => {
            for (let edge of edges) {
                let newEdge: GD.edge<CellPoint>;
                const { left, right } = edge;

                if (right && right.type === k && right.group === gp) {
                    // flip edge
                    newEdge = Object.assign(
                        [edge[1], edge[0]] as GD.edge<CellPoint>,
                        {
                            left: right,
                            right: left
                        }
                    );
                } else {
                    newEdge = edge;
                }
                edge = newEdge;
                drawingContext.beginPath();
                drawingContext.moveTo(...edge[0]);
                const dist = norm(
                    [edge.left.x - edge[0][0], edge.left.y - edge[0][1]],
                    2
                );

                drawingContext.lineTo(
                    edge[0][0] + dist[0],
                    edge[0][1] + dist[1]
                );
                drawingContext.lineTo(...edge[1]);
                drawingContext.closePath();
                drawingContext.fill();
            }
        });
    });
    /*
        eg.map(edge => {
            if (!edge?.left) return;
            drawingContext.fillStyle = 'black';
            drawingContext.beginPath();
            drawingContext.moveTo(...edge[0]);
            const dist = norm(
                [edge.left.x - edge[0][0], edge.left.y - edge[0][1]],
                8
            );
    
            drawingContext.lineTo(edge[0][0] + dist[0], edge[0][1] + dist[1]);
            drawingContext.lineTo(...edge[1]);
            drawingContext.closePath();
            drawingContext.fill();
        });
    */
    // voronoiGraph.points.forEach(cell => {
    //     drawingContext.fillStyle = colours[cell.type] ?? 'rgb(250, 250, 250)';
    //     drawingContext.beginPath();
    //     const circleRadius =
    //         cell.type === 'red' ? 12 : cell.type === 'blue' ? 12 : 2;

    //     drawingContext.ellipse(
    //         cell.x,
    //         cell.y,
    //         circleRadius,
    //         circleRadius,
    //         0,
    //         0,
    //         Math.PI * 2
    //     );

    //     drawingContext.fill();
    // });
    window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);
