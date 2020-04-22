import * as NS from '@rupertofly/noise';
import * as d3 from 'd3';
import * as Del from 'd3-delaunay';
import * as h from '@rupertofly/h';
import vorReg from '@rupertofly/voronoi-regions';
const cv = document.createElement('canvas');
const ctx = cv.getContext('2d');
const [WID, HEI] = [800, 800];

cv.width = WID;
cv.height = HEI;
ctx.fillStyle = '#fefefe';
ctx.fillRect(0, 0, WID, HEI);
document.body.append(cv);
const lumiScale = d3
    .scaleLinear()
    .clamp(true)
    .rangeRound([20, 40, 50, 60, 70, 80, 90]);

const chromaScale = d3
    .scaleLinear()
    .domain([0, 3, 7])
    .range([30, 70, 10]);
const hues = [1, 32, 47, 115, 198, 271, 316];
const hueOffset = d3
    .scaleLinear()
    .domain([0, 7])
    .range([-1 * (360 / 48), 360 / 24]);

console.log(d3.hcl(d3.rgb('#271e15')).c); // chroma of 80 is highest, low maybe 20?
for (const l of d3.range(0, 7, 1)) {
    for (const h of hues) {
        const hueOffset = h > 150 ? (l - 3) * 8 : (l - 3) * -8;

        ctx.fillStyle = d3
            .hcl(h + 30 + hueOffset, chromaScale(l), 20 + l * 10)
            .toString();
        ctx.fillRect(10 + l * 30, hues.indexOf(h) * 30, 30, 40);
    }
}
