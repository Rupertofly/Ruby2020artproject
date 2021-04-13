import { lab } from 'd3-color';
import { interpolateLab } from 'd3-interpolate';
import { scaleLinear } from 'd3-scale';
import * as hs from 'hilbert-curve';
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const WID = (canvas.width = 2048);
const HEI = (canvas.height = 2048);
const ctx = canvas.getContext('2d');
const BG = '#0f0f0f';
const TFLAG = [
  '#5BCEFA',
  '#F5A9B8',
  '#FFFFFF',
  '#F5A9B8',
  '#5BCEFA',
  '#D52D00',
  '#FF9A56',
  '#FFFFFF',
  '#D362A4',
  '#A30262',
] as const;
ctx.fillStyle = BG;
ctx.fillRect(0, 0, WID, HEI);
const colB = '#073642';
const colA = '#cb4b16';
const aLab = lab(colA);
const bLab = lab(colB);
const XYScale = 100;
const aScale = scaleLinear([-XYScale, XYScale]);
const bScale = scaleLinear([-XYScale, XYScale]);
const lScale = scaleLinear([20, 50]);
console.log('colA', aLab);
console.log('colB', bLab);

ctx.strokeStyle = 'black';
ctx.lineCap = 'square';
const ORDER = 5;
const RADIUS = 1920;
const SIZE = 2 ** ORDER;
const RAD = RADIUS / SIZE;
ctx.lineWidth = 30;
const XOFST = (WID - RADIUS) / 2;
const YOFST = (HEI - RADIUS) / 2;
const cApos = hs.pointToIndex(
  {
    x: ((XYScale + aLab.a) / (XYScale * 2)) * SIZE,
    y: ((XYScale + aLab.b) / (XYScale * 2)) * SIZE,
  },
  ORDER
);
const cBpos = hs.pointToIndex(
  {
    x: ((XYScale + bLab.a) / (XYScale * 2)) * SIZE,
    y: ((XYScale + bLab.b) / (XYScale * 2)) * SIZE,
  },
  ORDER
);
ctx.translate(XOFST + RAD / 2, -1 * YOFST - RAD / 2);
ctx.translate(0, HEI);
ctx.scale(1, -1);
for (let i = 1; i <= SIZE ** 2; i++) {
  const perDone = i / SIZE ** 2;
  let { x: px, y: py } = hs.indexToPoint(i - 1, ORDER);
  let { x, y } = hs.indexToPoint(i, ORDER);
  if (i < SIZE ** 2) {
    ctx.beginPath();
    ctx.strokeStyle = interpolateLab(TFLAG[(i + 9) % 10], TFLAG[i % 10])(0.5);
    // ctx.strokeStyle = TFLAG[(i - 1) % 10];
    ctx.moveTo(px * RAD, py * RAD);
    ctx.lineTo(x * RAD, y * RAD);
    ctx.stroke();
  }
  // let { x: px, y: py } = hs.indexToPoint(i - 1, ORDER);
  let r = RAD / 2 - 6;
  ctx.fillStyle = TFLAG[(i - 1) % 10];
  ctx.fillRect(px * RAD - r, py * RAD - r, RAD - 12, RAD - 12);
}
ctx.fillStyle = colA;
let { x, y } = hs.indexToPoint(cApos, ORDER);
