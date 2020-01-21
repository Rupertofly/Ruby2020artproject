import {
  range,
  arc,
  DefaultArcObject,
  scaleBand,
  interpolateRainbow,
  scaleLinear,
  scaleQuantize,
  extent,
  voronoi,
  geoPath,
  polygonCentroid,
  rgb,
  contours,
} from 'd3';
import { createTextChangeRange } from 'typescript';
import * as noise from '@Rupertofly/noise';
import * as cap from '@rupertofly/capture-client';
import { myRoundPolly, drawMultiPG, drawPG } from '@rupertofly/rubyq-utils';
let ns = new noise.simplex4DNoise(2);
let ns2 = new noise.simplex3DNoise(2);
const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
let capture = new cap.CaptureClient(5696, canvas);
const ctx = canvas.getContext('2d')!;
const { width: WID, height: HEI } = canvas;
const TAU = Math.PI * 2;
const { PI, sin, cos, sqrt, floor: flr } = Math;
interface myRing extends DefaultArcObject {
  round: number;
}
capture.start({
  frameRate: 30,
  lengthIsFrames: true,
  maxLength: 360,
  name: 'contours',
});
const colScale = scaleLinear()
  .domain(range(0, 6, 1 / 6))
  .range([
    '#ff6188',
    '#fc9867',
    '#ffd866',
    '#a9dc76',
    '#78dce8',
    '#ab9df2',
  ] as any);
const valueTranform = scaleLinear()
  .domain([-0.8, 0.8])
  .range([0, 1]);
const sizeTransform = scaleLinear()
  .domain([-0.8, 0, 0.8])
  .range([0, 1, 0]);
const SCALE = 5;
const MAX_RAD = sqrt(WID ** 2 + HEI ** 2) / 2;
const CELL_SIZE = 32;
const GAP = 4;
const SEG = CELL_SIZE + GAP;
const RINGS = Math.ceil(MAX_RAD / SEG);
const numOfCells = (radius: number) => Math.round((2 * PI * radius) / SEG);
const cellAngleWidth = (radius: number) =>
  (TAU / numOfCells(radius)) * (CELL_SIZE / SEG);

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, WID, HEI);
ctx.fillStyle = 'white';
let frameCount = 0;

let newImageData: number[][] = new Array(64 * 64).fill([0, 0, 0, 0]);
newImageData = newImageData.map((vl, i) => {
  let v = Math.random() * 24;
  let r = Math.random() > 0.5 ? 128 : 0;
  let g = Math.random() > 0.8 ? 128 : 0;
  return [r, g, 0, v];
});
let texIG = new ImageData(64, 64);
texIG.data.set(new Uint8ClampedArray(newImageData.flat().flat()));
let texCanvas = new OffscreenCanvas(16, 16);
const texctx = texCanvas.getContext('2d')!;
texctx.putImageData(texIG, 0, 0);
let tex: CanvasPattern;
let textex = ctx.createPattern(texCanvas, 'repeat')!;
const colvals: string[] = [];
const render = () => {
  let values: number[] = [];
  const t = (frameCount % 360) / 360;
  ctx.clearRect(0, 0, WID, HEI);
  ctx.fillStyle = '#2D2A2E';
  ctx.fillRect(0, 0, WID, HEI);
  let points: [number, number][] = [];
  let colours: string[] = [];
  ctx.translate(WID / 2, HEI / 2);
  const ring = arc<myRing>()
    .context(ctx)
    .cornerRadius(d => d.round);
  // put drawing here
  for (let i of range(RINGS)) {
    const radius = i * (CELL_SIZE + GAP);
    const CELL_WID = cellAngleWidth(radius);
    const CELL_COUNT = numOfCells(radius);
    range(CELL_COUNT).map(a => {
      const cloc = a * (TAU / CELL_COUNT);
      const value = ns.get(t, (a / CELL_COUNT) * SCALE, (i / RINGS) * SCALE);
      const val2 = ns.get(
        t,
        10 + (a / CELL_COUNT) * SCALE,
        10 + (i / RINGS) * SCALE
      );
      values.push(valueTranform(value));
      if (frameCount === 0)
        colvals.push(colScale(valueTranform(value)).toString());
      const xSize = CELL_WID / 4 + sizeTransform(value) * (CELL_WID / 4);
      const ySize = CELL_SIZE / 4 + sizeTransform(value) * (CELL_SIZE / 4);
      points.push([
        radius * cos(cloc) + value * 40,
        radius * sin(cloc) + val2 * 40,
      ]);
    });
  }
  let v = voronoi()
    .extent([
      [-WID / 2, -HEI / 2],
      [WID / 2, HEI / 2],
    ])
    .polygons(points);
  v.map((polygon, i) => {
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowColor = '#00000084';
    ctx.fillStyle = colvals[i];
    ctx.strokeStyle = '#eeeeee';
    ctx.lineWidth = 0;
    drawPG(polygon, ctx);
    ctx.fill();
    ctx.shadowColor = '#00000000';
    textex.setTransform(
      new DOMMatrix().translate(
        10 * i + points[i][0] + WID / 2,
        10 * i + points[i][1] + WID / 2
      )
    );
    ctx.fillStyle = textex;
    ctx.fill();
    ctx.stroke();
    textex.setTransform(new DOMMatrix().translate(0, 0));
    ctx.strokeStyle = textex;
    ctx.stroke();
    // myRoundPolly(
    //   ctx,
    //   polygon.map(d => ({ x: d[0], y: d[1] })),
    //   0
    // );
  });
  ctx.resetTransform();
  frameCount++;
  capture.capture().then(() => requestAnimationFrame(() => render()));
};
requestAnimationFrame(render);
