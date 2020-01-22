import * as d3 from 'd3';
import REGL from 'regl';
import { simplex4DNoise } from '@rupertofly/noise';
import vertShader from './shaders/vertShader.vert';
import fragShader from './shaders/CRTfragShader.frag';
import * as cl from '@rupertofly/capture-client';
const frontCanvas: HTMLCanvasElement = document.getElementById(
  'canvas'
) as HTMLCanvasElement;
const client = new cl.CaptureClient(4569, frontCanvas);
client.start({
  frameRate: 24,
  lengthIsFrames: true,
  maxLength: 360,
  name: 'radar',
});
const RADIUS = Math.floor(frontCanvas.width / 6);
const backCanvas = document.createElement('canvas');
backCanvas.width = RADIUS;
backCanvas.height = RADIUS;
console.log(vertShader);
const gl = REGL(frontCanvas);
const noiseScale = d3
  .scaleLinear()
  .domain([-0.83, 0.83])
  .range([0, 255])
  .clamp(true);
// backCanvas.hidden = true;
const mapContours = d3
  .contours()
  .size([RADIUS, RADIUS])
  .thresholds(d3.range(0, 255, 255 / 6));
document.body.appendChild(backCanvas);
gl.clear({
  color: [0, 0, 0, 1],
});
const filterCRT = gl<{ inputTexture: any }>({
  vert: vertShader,
  frag: fragShader,
  attributes: {
    position: gl.buffer([
      [-1, 1],
      [-1, -1],
      [1, 1],
      [1, -1],
    ]),
  },
  count: 4,
  primitive: 'triangle strip',
  uniforms: { inputTexture: (ctx, prop) => prop.inputTexture },
});
const backContext: CanvasRenderingContext2D = backCanvas.getContext('2d');
backContext.clearRect(0, 0, RADIUS, RADIUS);
backContext.fillStyle = '#111111';
backContext.strokeStyle = 'white';
const NS_RAD = 1;
const NS_SCL = 1 / 20;
const noise = new simplex4DNoise(NS_RAD);
let ticks = 0;
const contourTexture = gl.texture();
const render = () => {
  backContext.fillRect(0, 0, RADIUS, RADIUS);
  const t = (ticks % 360) / 360;
  const contours = mapContours(
    d3.range(RADIUS ** 2).map(i => {
      const [x, y] = [NS_SCL * (i % RADIUS), NS_SCL * Math.floor(i / RADIUS)];
      return noiseScale(noise.get(t, x, y));
    })
  );
  contours.map(threshold => {
    backContext.lineWidth = 0.4 + threshold.value / 128;
    threshold.coordinates.map(shape => {
      backContext.beginPath();
      shape.map(loop => {
        loop.map((pt, i) =>
          i > 0
            ? backContext.lineTo(pt[0], pt[1])
            : backContext.moveTo(pt[0], pt[1])
        );
        backContext.closePath();
      });
      backContext.stroke();
    });
  });
  contourTexture({ width: RADIUS, height: RADIUS, data: backCanvas });
  filterCRT({ inputTexture: contourTexture });
  ticks++;
  // window.requestAnimationFrame(render);
  client.capture().then(() => requestAnimationFrame(render));
};
window.requestAnimationFrame(render);
