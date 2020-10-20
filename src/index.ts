import * as NS from '@rupertofly/noise';
import * as REC from '@rupertofly/capture-client';
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
const [WID, HEI, RAD] = [720, 720, 720 / 2];
const PI = Math.PI;
const TAU = PI * 2;
const n = new NS.simplex3DNoise(2);
const n2 = new NS.simplex3DNoise(2);
const n3 = new NS.simplex3DNoise(2);

canvas.width = WID;
canvas.height = HEI;
ctx.lineWidth = 16;
ctx.save();
let frameNumber = 0;
const Capture = new REC.CaptureClient(4646, canvas);

Capture.start({
  frameRate: 60,
  lengthIsFrames: true,
  maxLength: 500,
  name: 'waving'
});

function drawLoop() {
  ctx.translate(WID / 2, HEI / 2);
  ctx.fillStyle = '#373737';
  ctx.fillRect(-RAD, -RAD, WID, HEI);
  ctx.globalCompositeOperation = 'lighter';
  drawCircle(
    0,
    0,
    '#cc05',
    '#cc0d',
    RAD / 1.5,
    128,
    n,
    (frameNumber % 500) / 500
  );
  drawCircle(
    0,
    0,
    '#0cc5',
    '#0ccd',
    RAD / 1.5,
    128,
    n2,
    (frameNumber % 500) / 500
  );
  drawCircle(
    0,
    0,
    '#c0c5',
    '#c0cd',
    RAD / 1.5,
    128,
    n3,
    (frameNumber % 500) / 500
  );
  ctx.globalCompositeOperation = 'multiply';
  ctx.translate(0, 100);
  drawCircle(
    0,
    0,
    '#00f7',
    '#00fd',
    RAD / 1.5,
    128,
    n,
    ((250 + frameNumber) % 500) / 500
  );
  drawCircle(
    0,
    0,
    '#f007',
    '#f00d',
    RAD / 1.5,
    128,
    n2,
    ((250 + frameNumber) % 500) / 500
  );
  drawCircle(
    0,
    0,
    '#0f07',
    '#0f0d',
    RAD / 1.5,
    128,
    n3,
    (frameNumber % 500) / 500
  );
  frameNumber = frameNumber + 1;

  ctx.globalCompositeOperation = 'source-over';
}

function drawCircle(
  x: number,
  y: number,
  c: string,
  s: string,
  r: number,
  w: number,
  ns: NS.simplex3DNoise,
  t: number
) {
  ctx.fillStyle = c;
  ctx.beginPath();
  for (let u = 0; u < TAU; u += TAU / 1024) {
    const R = r + ns.get(t, u * 5) * w;

    if (u) {
      ctx.lineTo(RAD - u * RAD, Math.sin((u + t) * TAU * 2) * 16 + R / 4);
    } else ctx.moveTo(RAD - u * RAD, Math.sin((u + t) * TAU * 2) * 16 + R / 4);
  }
  ctx.lineTo(-RAD, RAD);
  ctx.lineTo(RAD, RAD);
  ctx.closePath();
  ctx.fill();
}

function dLoopWrap() {
  ctx.save();
  drawLoop();
  ctx.restore();
  Capture.capture().then(() => window.requestAnimationFrame(dLoopWrap));
}
window.requestAnimationFrame(dLoopWrap);
