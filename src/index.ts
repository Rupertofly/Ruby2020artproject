import * as NS from '@rupertofly/noise';
import * as d3 from 'd3';
import CC from '@rupertofly/capture-client';
import BS from '@rupertofly/b-spline';
function generateCell(
    i: number,
    width: number,
    noiseSource: NS.simplex4DNoise
) {
    const y = Math.floor(i / width);
    const x = i % width;
    const out = noiseSource.get(1, x, y);

    return d3.scaleLinear().domain([-0.8, 0.8])(out);
}
function sigmoidLog(v: number) {
    return 1 / (1 + Math.pow(Math.E, -6 * (v - 0.5)));
}
function returnLeftAndUp(
    i: number,
    width: number,
    height: number
): [number, number] {
    const y = Math.floor(i / width);
    const x = i % width;
    const toI = (x, y) => y * width + x;

    return [
        toI(x < 1 ? width - 1 : x - 1, y),
        toI(x, y < 1 ? height - 1 : y - 1)
    ];
}
function distHof(width: number, height: number) {
    return (v: number, i: number, arr: number[]) => {
        const sub = Math.random() * v;
        const portion = sigmoidLog(0.1 + Math.random());
        const [l, u] = returnLeftAndUp(i, width, height);

        arr[l] += 1 * portion * sub;
        arr[u] += 1 * (1 - portion) * sub;
        arr[i] = v - sub;
    };
}
function newWaveChanceHof(
    chance: number,
    width: number,
    ns: NS.simplex4DNoise
) {
    return (v: number, i: number, arr: number[]) => {
        const y = Math.floor(i / width);
        const x = i % width;
        const out = ns.get(1, x / 100, y / 100);

        const nv = d3.scaleLinear().domain([-0.8, 0.8])(out);

        arr[i] = Math.random() < chance ? nv : v;
    };
}
const cnvs = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = cnvs.getContext('2d');
const noise = new NS.simplex4DNoise(32);
const WID = 720;
const HEI = 720;
const RAD = 100;
const CCap = new CC(4646, cnvs);
const xCoordScale = d3
    .scaleLinear()
    .domain([0, RAD])
    .range([0, WID]);
const yCoordScale = d3
    .scaleLinear()
    .domain([0, RAD])
    .range([0, HEI]);
const coordScale = (input: [number, number] | number[]) =>
    [xCoordScale(input[0]), yCoordScale(input[1])] as [number, number];

ctx.fillStyle = 'black';
cnvs.height = HEI;
cnvs.width = WID;
ctx.fillRect(0, 0, WID, HEI);
const points = d3.range(RAD ** 2).map(i => generateCell(i, RAD, noise));
const contourFunc = d3
    .contours()
    .size([RAD, RAD])
    .smooth(true)
    .thresholds(d3.range(0, 1, 1 / 8));

CCap.start({
    frameRate: 16,
    lengthIsFrames: false,
    maxLength: 10,
    name: 'waves'
});
function render() {
    points.forEach(distHof(RAD, RAD));
    ctx.shadowColor = d3.gray(20, 0.3).toString();
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 1;
    const toI = (x, y) => ((RAD + y) % RAD) * RAD + ((RAD + x) % RAD);

    points.forEach(newWaveChanceHof(0.03, RAD, noise));
    const nP = points.map((v, i, arr) => {
        let acc = 0;

        for (let xOff = -1; xOff <= 1; xOff++) {
            for (let yOff = -1; yOff <= 1; yOff++) {
                const y = Math.floor(i / RAD);
                const x = i % RAD;
                const RATE = !xOff && !yOff ? 1 / 2 : 1 / 16;

                acc += RATE * arr[toI(x + xOff, y + yOff)];
            }
        }

        return acc;
    });

    contourFunc(nP).forEach(cMP => {
        ctx.fillStyle = d3.interpolateLab('#2ea3d6', '#abdaef')(cMP.value);
        cMP.coordinates.forEach(shape => {
            const outer = shape[0];
            const holes: number[][][] = shape.slice(1);

            ctx.beginPath();
            const shapeSpline = d3
                .range(0, 1, 1 / 800)
                .map(t => BS(t, 3, [...outer, ...outer.slice(0, 4)]));
            const start = ctx.moveTo(...coordScale(shapeSpline[0]));

            shapeSpline.slice(1).forEach(v => ctx.lineTo(...coordScale(v)));
            ctx.closePath();

            if (shape.length > 1) {
                holes.forEach(hl => {
                    const holeSpline = d3
                        .range(0, 1, 1 / 800)
                        .map(t => BS(t, 3, [...hl, ...hl.slice(0, 4)]));

                    const hlst = holeSpline[0];

                    ctx.moveTo(...coordScale(hlst));
                    holeSpline
                        .slice(1)
                        .forEach(v => ctx.lineTo(...coordScale(v)));
                    ctx.closePath();
                });
            }
            ctx.fill();
        });
    });
    CCap.capture().then(() => window.requestAnimationFrame(render));
}
render();
