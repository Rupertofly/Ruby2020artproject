import PointGraph from './PointGraph';
import CellPoint from './CellPoint';
import * as d from 'd3-delaunay';
import GD from './GraphDiagram';
import BS from '@rupertofly/b-spline';
import { sample } from 'lodash';
import CC from '@rupertofly/capture-client';
import { range, polygonCentroid } from 'd3';
import { hullsFromGroup } from './getHulls';
enum colours {
    red = 'rgb(245, 106, 104)',
    blue = 'rgb(88, 181, 222)',
    purple = 'rgb(180, 116, 238,0.8)'
}
enum sColours {
    red = '#fab5b3',
    blue = '#abdaef',
    purple = 'rgb(180, 116, 238,0.8)'
}
type celltype = undefined | 'red' | 'blue';
type pt = [number, number];
const canvas = document.getElementById(`canvas`) as HTMLCanvasElement;

canvas.width = 1080;
canvas.height = 1920;
const drawingContext = canvas.getContext(`2d`);
const graph = new PointGraph(canvas.width, canvas.height, 1000);
const Cap = new CC(4646, canvas);

/* function drawCircle(pt: pt, radius = 5, stroke = '#fab5b3', fill = '#f56a68') {
    const [x, y] = pt;

    drawingContext.strokeStyle = stroke;
    drawingContext.fillStyle = fill;
    drawingContext.beginPath();
    drawingContext.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
    drawingContext.fill();
    drawingContext.stroke();
}
const vecMultSc = (vec: pt, sc: number) => [vec[0] * sc, vec[1] * sc] as pt;
const vecAddSc = (vec: pt, sc: number) => [vec[0] + sc, vec[1] + sc] as pt;
const vecAdd = (vecA: pt, vecB: pt) =>
    [vecA[0] + vecB[0], vecA[1] + vecB[1]] as pt;
const vecInt = (vecA: pt, vecB: pt, t: number) =>
    vecAdd(vecMultSc(vecA, 1 - t), vecMultSc(vecB, t - 0));
const DEG = 6;
const cnP: [number, number][] = [
    [100, 100],
    [50, 200],
    [100, 300],
    [300, 300],
    [350, 200],
    [300, 100]
];
const fM = cnP.slice(0, DEG);
const mP = cnP.length;

cnP.push([0, 0]);

cnP.push(...fM);
cnP.map(p => drawCircle(p, 3));

canvas.onmousemove = e => (cnP[mP] = [e.offsetX, e.offsetY]);

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
 */
function constrain(val: number, min: number, max: number) {
    return val < min ? min : val > max ? max : val;
}

function samePoint(a: pt, b: pt) {
    return a[0] === b[0] && a[1] === b[1];
}
function drawPath(
    path: Array<pt | number[]>,
    context: CanvasRenderingContext2D,
    close = true
) {
    context.moveTo(...(path[0] as pt));
    path.slice(1).forEach(([x, y]) => context.lineTo(x, y));
    if (close) context.closePath();
}
function drawSpline(
    path: Array<pt>,
    context: CanvasRenderingContext2D,
    deg: number,
    close = true
) {
    const inputPoints = path.slice(0);

    if (close) inputPoints.push(...path.slice(0, deg));
    context.moveTo(...BS<pt>(0, deg, inputPoints));
    for (let i = 0; i < 1; i += 1 / (path.length * 3)) {
        context.lineTo(...BS<pt>(i, deg, inputPoints));
    }
    if (close) context.closePath();
}
Cap.start({
    frameRate: 30,
    lengthIsFrames: true,
    maxLength: 6 * 30,
    name: `blurple`
});
function render() {
    drawingContext.shadowColor = `rgba(0,0,0,0.4)`;
    drawingContext.shadowBlur = 3;
    drawingContext.shadowOffsetX = 1;
    drawingContext.shadowOffsetY = 1;
    function drawloop(
        type: string
    ): (
        value: [number, number][],
        index: number,
        array: [number, number][][]
    ) => void {
        return l => {
            drawingContext.fillStyle = colours[type] ?? 'black';
            drawingContext.strokeStyle = sColours[type] ?? 'black';
            drawingContext.beginPath();
            drawSpline(l, drawingContext, Math.min(l.length, 8), true);
            drawingContext.shadowColor = `rgba(0,0,0,0.2)`;
            drawingContext.shadowBlur = 3;
            drawingContext.shadowOffsetX = 2;
            drawingContext.shadowOffsetY = 2;
            drawingContext.stroke();
            drawingContext.shadowColor = `rgba(0,0,0,0.0)`;
            drawingContext.fill();
        };
    }
    // graph.forceSim.alpha() > 0.1 && console.time('x');
    drawingContext.fillStyle = '#fafafa';
    drawingContext.fillRect(0, 0, canvas.width, canvas.height);
    drawingContext.lineWidth = 8;
    const hulls: pt[][][] = [];

    graph.forceSim.tick(1);
    graph.runVoronoi();
    const rg = graph.getRegionHulls();

    graph.cellPoints.forEach(cell => {
        if (cell.type === undefined) return;
        const nb = graph.currentDiagram.neighbors(cell.id);

        if (nb.every(n => n?.type !== cell.type) && cell.type !== undefined) {
            cell.type = undefined;
        }
        if (!nb.every(n => n?.type === cell.type || n?.type === undefined)) {
            cell.type = undefined;
        }
    });
    rg.forEach((typeCells, type) => {
        typeCells.forEach((groupedCells, group) => {
            const h = hullsFromGroup(groupedCells, type, group);

            hulls.push(h);
            h.map(drawloop(type));
        });
    });
    Cap.capture().then(() => requestAnimationFrame(render));
}
requestAnimationFrame(render);
