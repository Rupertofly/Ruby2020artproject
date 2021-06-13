import { range } from 'd3-array'
import { hcl } from 'd3-color'
import { Delaunay } from 'd3-delaunay'
import { polygonCentroid } from 'd3-polygon'
import { randomNormal, randomUniform } from 'd3-random'
const { PI } = Math
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const RAD = 1280
const SMLRAD = 128
canvas.width = RAD * 2
canvas.height = RAD * 2
const ctx = canvas.getContext('2d')
const setFill = (s: string) => (ctx.fillStyle = s)
const setStroke = (s: string) => (ctx.strokeStyle = s)
setFill(hcl(90, 3, 98).toString())
const rndS = randomUniform(-RAD, RAD)
const COUNT = 48
let pts = range(COUNT)
    .map(() => [rndS(), rndS()])
    .flat()
let del = new Delaunay(pts)
for (let f of range(24)) {
    ;[...del.voronoi([-RAD, -RAD, RAD, RAD]).cellPolygons()].forEach((pg) => {
        let i = pg.index * 2
        let [x, y] = polygonCentroid(pg as any)
        pts[i] = x
        pts[i + 1] = y
    })
    del = new Delaunay(pts)
}
console.log(del)

ctx.fillRect(0, 0, RAD * 2, RAD * 2)
ctx.translate(RAD, RAD)
setFill('black')
ctx.lineWidth = 12
// Ranges
const hueRange = randomUniform(0, 45),
    circHueOff = randomUniform(0, 200),
    chromaRange = randomUniform(30, 60),
    lightRange = randomUniform(30, 60),
    offset = randomNormal(16, 8),
    offRange = randomUniform(-32, 32),
    widRange = randomUniform(4, 16),
    radRange = randomUniform((-1 * RAD) / 2, (1 * RAD) / 2),
    sizeRange = randomNormal(RAD / 12, RAD / 48)
for (let c of range(COUNT)) {
    let x = pts[c * 2]
    let y = pts[c * 2 + 1]
    ctx.save()
    ctx.translate(x, y)
    let size = sizeRange()
    let ch = circHueOff()
    for (let i of range(300)) {
        setStroke(
            hcl(hueRange() + ch, chromaRange(), lightRange(), 0.01).toString()
        )
        ctx.lineWidth = widRange()
        ctx.beginPath()
        ctx.ellipse(
            offRange(),
            offRange(),
            size + offset(),
            size + offset(),
            0,
            0,
            PI * 2
        )
        ctx.stroke()
    }
    ctx.restore()
}

export {}
