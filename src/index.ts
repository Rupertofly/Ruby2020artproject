import { range } from 'd3';
import bs from '@rupertofly/b-spline';
type pt = [number, number];
const cv: HTMLCanvasElement = document.getElementById(
    'canvas'
) as HTMLCanvasElement;

cv.width = 1080;
cv.height = 1920;
function mainHilbert() {
    const order = 5;
    const extent = 2 ** order;
    const points = extent ** 2;
    const len = 1920 / extent;
    const path: pt[] = new Array<pt>(points);
    const ctx = (document.getElementById(
        'canvas'
    ) as HTMLCanvasElement).getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = '#d34f73';
    // ctx.fillStyle = 'white';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowColor = 'rgb(0,0,0,0.5)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineWidth = 8 * 2;
    ctx.lineJoin = 'round';
    for (const i of range(points)) {
        path[i] = hilbert(i, order);
        // ctx.lineTo(path[i][0] * len, path[i][1] * len);
        // ctx.lineTo(path[i - 1][0] * len + 64, path[i - 1][1] * len + 64);
    }
    const startDegree = 1;
    const st = path[0];
    const en = path[path.length - 1];

    ctx.moveTo(5, 5);
    for (let t = 0; t < 1; t += 1 / 16384) {
        const degree = Math.floor(t * (path.length / 8)) || 1;
        const newPath: pt[] = [
            ...(range(degree) as any).fill(st),
            ...path,
            ...(range(degree) as any).fill(en)
        ];

        const pt = bs(t, degree, newPath);

        ctx.lineTo(5 + pt[0] * len, 5 + pt[1] * len);
    }
    // ctx.stroke();
    // ctx.shadowColor = 'rgb(0,0,0,0)';
    ctx.fill();
    console.log(path);
}
function hilbert(index: number, order: number) {
    const points: pt[] = [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0]
    ];
    let newIndex = index;
    let internalIndex = newIndex & 3;
    const vertex: pt = points[internalIndex] as pt;

    for (const j of range(1, order)) {
        newIndex = newIndex >>> 2;
        internalIndex = newIndex & 3;
        const length = 2 ** j;
        let temp = 0;

        switch (internalIndex) {
            case 0:
                temp = vertex[0];

                vertex[0] = vertex[1];
                vertex[1] = temp;
                break;
            case 1:
                vertex[1] = vertex[1] + length;
                break;
            case 2:
                vertex[0] = vertex[0] + length;
                vertex[1] = vertex[1] + length;
                break;
            case 3:
                temp = length - 1 - vertex[0];
                vertex[0] = length - 1 - vertex[1];
                vertex[1] = temp;
                vertex[0] = vertex[0] + length;
                break;
        }
    }

    return vertex;
}
mainHilbert();
