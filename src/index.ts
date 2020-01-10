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
import { myRoundPolly } from '@rupertofly/rubyq-utils';
let ns = new noise.simplex4DNoise(2);
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
const CELL_SIZE = 16;
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
      colours.push(
        rgb(
          valueTranform(value) * 255,
          valueTranform(value) * 255,
          valueTranform(value) * 255
        ).toString()
      );
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
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowColor = '#00000000';
    ctx.fillStyle = colours[i];
    ctx.strokeStyle = colours[i];
    ctx.beginPath();
    myRoundPolly(
      ctx,
      polygon.map(d => ({ x: d[0], y: d[1] })),
      0
    );
    ctx.fill();
    ctx.stroke();
  });
  let id = ctx.getImageData(0, 0, WID, HEI);
  ctx.resetTransform();
  let pixels: number[] = [];
  for (let index = 0; index < id.data.length; index += 4) {
    pixels.push(id.data[index]);
  }
  let cc = contours()
    .size([WID, HEI])
    .thresholds(range(0, 255, 32));
  let output = cc(pixels);
  output.map(threshold => {
    ctx.fillStyle = '#fefefe';
    ctx.shadowColor = `#111111${Math.floor(threshold.value)
      .toString(16)
      .padStart(2, '0')}`;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;
    threshold.coordinates.map(polygon => {
      ctx.beginPath();
      polygon[0].map(v => ctx.lineTo(v[0], v[1]));
      ctx.closePath();
      if (polygon.length > 1) {
        for (let index = 1; index < polygon.length; index++) {
          polygon[index].map(v => ctx.lineTo(v[0], v[1]));
          ctx.closePath();
        }
      }
      ctx.fill();
    });
  });

  frameCount++;
  capture.capture().then(() => requestAnimationFrame(render));
};
requestAnimationFrame(render);
