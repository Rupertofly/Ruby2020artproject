import { range, shuffle } from 'd3-array'
import * as h from '@rupertofly/h'
import { hcl } from 'd3-color'
import { Delaunay } from 'd3-delaunay'
import { polygonCentroid } from 'd3-polygon'
import { randomNormal, randomUniform } from 'd3-random'
const { PI } = Math
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const WID = (canvas.width = 1240)
const HEI = (canvas.height = 1748)
const ctx = canvas.getContext('2d')
const setFill = (s: string) => (ctx.fillStyle = s)
const setStroke = (s: string) => (ctx.strokeStyle = s)
setFill('#fff')
const randomX = randomUniform(0, WID)
const randomY = randomUniform(0, HEI)
const COUNT = 48
let pts = range(COUNT)
    .map(() => [randomX(), randomY()])
    .flat()
let del = new Delaunay(pts)
for (let f of range(24)) {
    ;[...del.voronoi([0, 0, WID, HEI]).cellPolygons()].forEach((pg) => {
        let i = pg.index * 2
        let [x, y] = polygonCentroid(pg as any)
        pts[i] = x
        pts[i + 1] = y
    })
    del = new Delaunay(pts)
}
console.log(del)

ctx.fillRect(0, 0, WID, HEI)
setFill('white')
ctx.lineWidth = 2
// Ranges
const hueRange = randomUniform(15, 120),
    circHueOff = randomUniform(0, 30),
    chromaRange = randomUniform(30, 60),
    lightRange = randomUniform(40, 80),
    offset = randomUniform(-12, 12),
    offRange = randomUniform(-4, 4),
    widRange = randomUniform(3, 10)
let v = del.voronoi([0, 0, WID, HEI])
let pgs = v.cellPolygons()
let rd = shuffle(range(COUNT))
let sn = [rd[0], rd[1]] as const
let route = h.djikstraPath(
    sn[0],
    sn[1],
    (n) => v.neighbors(n),
    () => 1
)
let path = route.map((i) => [pts[i * 2], pts[i * 2 + 1]] as [number, number])
let linech = -12
for (let p of range(64)) {
    ctx.lineWidth = widRange()
    setStroke(
        hcl(hueRange() + linech, chromaRange(), lightRange(), 0.03).toString()
    )
    h.drawBezierLoop(
        h.bezierSpline(
            path.map((v, i) =>
                i !== 0 && i !== path.length - 1
                    ? (v.map((n) => n + offset()) as [number, number])
                    : v
            ),
            3,
            false
        ),
        false,
        ctx
    )
    ctx.stroke()
}
for (let pg of pgs) {
    let c = pg.index
    if (route.includes(c) && !sn.includes(c)) continue
    let x = pts[c * 2]
    let y = pts[c * 2 + 1]
    let cSize = h.minDistFromCentroid(pg as any as Loop)
    ctx.save()
    ctx.translate(x, y)
    let size = cSize * 0.8
    let ch = circHueOff()
    ctx.beginPath()
    ctx.ellipse(0, 0, size, size, 0, 0, PI * 2)
    ctx.fill()
    for (let i of range(500)) {
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
            Math.random() * PI,
            0,
            PI * 2
        )
        ctx.stroke()
    }
    ctx.restore()
}

export {}
