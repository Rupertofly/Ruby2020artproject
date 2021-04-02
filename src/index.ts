import * as NS from '@rupertofly/noise';
import * as REC from '@rupertofly/capture-client';
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
const [WID, HEI] = [1080, 1920];
const PI = Math.PI;
const TAU = PI * 2;
const n = new NS.simplex3DNoise(0.5);
const n2 = new NS.simplex3DNoise(0.5);
const n3 = new NS.simplex3DNoise(0.5);
let FG: CanvasImageSource;
let BG: CanvasImageSource;

function loadImage(src: string) {
    return new Promise<CanvasImageSource>(res => {
        const img = new Image(1080, 1920);

        img.src = src;
        img.onload = () => {
            res(img);
        };
    });
}
canvas.width = WID;
canvas.height = HEI;
ctx.lineWidth = 16;
// ctx.translate(0, -840);
ctx.save();
const frameNumber = 0;
const Capture = new REC.CaptureClient(4646, canvas);

function drawWave(
    time: number,
    noise: NS.simplex3DNoise,
    colour: string,
    height = 8
) {
    ctx.save();
    ctx.translate(0, 1440);
    const pts: [number, number][] = [];

    for (let x = 0; x <= 1080; x += 6) {
        pts.push([x, noise.get(time, x * 0.015) * height]);
    }
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(0, 1000);
    pts.map(p => ctx.lineTo(...p));
    ctx.lineTo(1080, 1000);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}
Capture.start({
    frameRate: 60,
    lengthIsFrames: true,
    maxLength: 360,
    name: 'waving'
});
const bg = 'rgb(152, 178, 209)';
const fg = '#01798c';
const of = 'rgb(87,61,30)';
const blue = { r: 90, g: 194, b: 198 };
// const fullOffset = 'rgb(152,178,239)';
// const fullOffset = 'rgb(152,239,209)';
// const fullOffset = 'rgb(239,178,209)';
// const fullOffset = 'rgb(239,178,239)';
// const fullOffset = 'rgb(152,239,239)';
// const fullOffset = 'rgb(239,239,209)';
let frameCount = 0;

function drawLoop() {
    ctx.fillStyle = '#373737';
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillRect(0, 0, 5555, 5555);
    ctx.drawImage(BG, 0, 0);
    ctx.fillStyle = '#2c3137';
    ctx.globalCompositeOperation = 'difference';
    drawWave(frameCount / 360, n, '#2b0000', 48);
    ctx.globalCompositeOperation = 'lighter';
    drawWave(frameCount / 360, n2, '#004800', 48);
    drawWave(frameCount / 360, n3, '#000055', 48);
    ctx.globalCompositeOperation = 'source-over';

    ctx.drawImage(FG, 0, 0);
    frameCount = frameCount + 1;
}

async function dLoopWrap() {
    ctx.save();
    drawLoop();
    ctx.restore();
    await Capture.capture();
    window.requestAnimationFrame(dLoopWrap);
}
const st = async () => {
    BG = await loadImage('/BG.png');
    FG = await loadImage('/FG.png');
    window.requestAnimationFrame(dLoopWrap);
};

st();
