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
type Position = [number, number];
import { createTextChangeRange } from 'typescript';
import * as noise from '@Rupertofly/noise';
import * as cap from '@rupertofly/capture-client';
import {
  myRoundPolly,
  drawMultiPG,
  drawPG,
  transformMultiPG,
} from '@rupertofly/rubyq-utils';
let ns = new noise.simplex4DNoise(2);
let ns2 = new noise.simplex3DNoise(2);
const canvas = document.getElementById('canvas')! as HTMLCanvasElement;
// let capture = new cap.CaptureClient(5696, canvas);
const ctx = canvas.getContext('2d')!;
const { width: WID, height: HEI } = canvas;
const TAU = Math.PI * 2;
const { PI, sin, cos, sqrt, floor: flr } = Math;
interface myRing extends DefaultArcObject {
  round: number;
}
// capture.start({
//   frameRate: 30,
//   lengthIsFrames: true,
//   maxLength: 360,
//   name: 'contours',
// });
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
const NS_SCALE = 1 / 60;
const RAD = 0.001;
const RES = 600;
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, WID, HEI);
ctx.fillStyle = 'white';
let frameCount = 0;
let noiseSource = new noise.simplex4DNoise(RAD);
// let texIG = new ImageData(64, 64);
// texIG.data.set(new Uint8ClampedArray(newImageData.flat().flat()));
// let texCanvas = new OffscreenCanvas(16, 16);
// const texctx = texCanvas.getContext('2d')!;
// texctx.putImageData(texIG, 0, 0);
// let tex: CanvasPattern;
// let textex = ctx.createPattern(texCanvas, 'repeat')!;
const colvals: string[] = [];
const render = () => {
  let values: number[] = [];
  const t = (frameCount % 360) / 360;
  ctx.clearRect(0, 0, WID, HEI);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, WID, HEI);
  range(RES).map(y =>
    range(RES).map(
      x =>
        (values[y * RES + x] = valueTranform(
          noiseSource.get(t, x * NS_SCALE, y * NS_SCALE)
        ))
    )
  );
  const RATIO = WID / RES;
  let pgs = contours()
    .size([RES, RES])
    .thresholds(range(0, 1, 1 / 6))(values);
  pgs.map(thresh => {
    ctx.lineWidth = 0 + thresh.value * 3;
    ctx.strokeStyle = 'white';
    let cx = thresh.coordinates.map(shape =>
      shape.map(loop =>
        loop.map(pt => [pt[0] * RATIO, pt[1] * RATIO] as [number, number])
      )
    );

    cx.map(shape => {
      ctx.beginPath();
      shape.map(loop => {
        ctx.moveTo(...loop[0]);
        range(1, loop.length).map(i => ctx.lineTo(...loop[i]));
        ctx.closePath();
      });
      ctx.stroke();
    });
  });
  frameCount++;
  requestAnimationFrame(render);
  // capture.capture().then(() => requestAnimationFrame(() => render()));
};
requestAnimationFrame(render);
