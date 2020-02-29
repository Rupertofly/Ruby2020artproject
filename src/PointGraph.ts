import * as d3 from 'd3';
import * as _ from 'lodash';
import CellPoint from './CellPoint';

/* TODO:

 */
// =====================================
// Constants

const NUM_POINTS = 200;
const DEF_WID = 600;
const DEF_HEI = 600;

// =====================================
// Helpers

// const { PI, floor: flr } = Math;
const rnd = (e = 1) => Math.random() * e;

function group<TObject, TKey>(
    a: ArrayLike<TObject>,
    key: (value: TObject) => TKey
): Map<TKey, TObject[]> {
    const groups = new Map<TKey, TObject[]>();

    for (const val of a as any) {
        const keyVal = key(val);
        const group = groups.get(keyVal);

        if (group) group.push(val);
        else groups.set(keyVal, [val]);
    }

    return groups;
}
// =====================================

// =====================================

export class PointGraph {
    // ===================================

    width = DEF_WID;
    height = DEF_HEI;
    pointsCount = NUM_POINTS;

    blankPoints: CellPoint[] = [];
    populatedPoints: CellPoint[] = [];

    voronoiFunction: d3.VoronoiLayout<CellPoint>;
    currentDiagram: d3.VoronoiDiagram<CellPoint>;
    forceSim: d3.Simulation<CellPoint, any>;

    // ===================================

    constructor(width?: number, height?: number, points?: number) {
        this.width = width ?? this.width;
        this.height = height ?? this.height;
        this.pointsCount = points ?? this.pointsCount;
        d3.range(this.pointsCount).forEach(i =>
            this.blankPoints.push(
                CellPoint.new(
                    rnd(this.width),
                    rnd(this.height),
                    _.sample([undefined, undefined, undefined, `red`, 'blue']),
                    i.toString()
                )
            )
        );
        this.voronoiFunction = d3
            .voronoi<CellPoint>()
            .x(d => d.x)
            .y(d => d.y)
            .size([this.width, this.height]);

        this.forceSim = d3.forceSimulation(this.blankPoints);
        this.forceSim.stop();
        // this.forceSim.alphaTarget(0);
        // this.forceSim.alphaDecay(0.001);
        const constrain = (n: number, min: number, max: number) =>
            Math.max(min, Math.min(max, n));
        const PADDING = 0.9;
        const inversePadding = 1 - PADDING;
        const manyBodyForce = d3
            .forceManyBody<CellPoint>()
            .strength(d => -4)
            .distanceMax(100);
        const gravityForce = d3
            .forceManyBody()
            .strength(0.4)
            .distanceMin(100);
        const spaceForce: d3.Force<CellPoint, any> = alpha => {
            const arr = this.currentDiagram || this.runV().currentDiagram;

            arr.polygons().map(pgon => {
                const [cx, cy] = d3.polygonCentroid(pgon);

                pgon.data.vx -= (pgon.data.x - cx) * alpha * 0.1;
                pgon.data.vy -= (pgon.data.y - cy) * alpha * 0.1;
            });
        };
        const touch = d3.forceCollide().radius(8);

        this.forceSim.force(`t`, touch);
        const groupingForce = d3
            .forceLink()
            .links(
                _.flatMap(
                    this.blankPoints
                        .filter(p => p.type)
                        .map((cell, i, arr) =>
                            arr
                                .filter(cd => cd !== cell)
                                .map(cd => ({ source: cell, target: cd }))
                        )
                )
            )
            .strength(0.00005)
            .distance(5);

        // this.forceSim.force(`grouping`, groupingForce);
        this.forceSim.force(`spacing`, spaceForce);
    }
    getRegionHulls() {
        const type = group(this.blankPoints, p => p.type);
    }
    groupCells(cells: CellPoint[] = this.blankPoints) {
        const cellSet = [...cells];
        const links = this.currentDiagram.links();
        const neighbours = cellSet.map(currentCell => ({
            currentCell,
            nbs: links
                .filter(checkLink => {
                    return (
                        currentCell === checkLink.source ||
                        currentCell === checkLink.target
                    );
                })
                .map(currentLnk =>
                    currentLnk.source === currentCell
                        ? currentLnk.target
                        : currentLnk.source
                )
        }));
        const typedCells = [...group(cellSet, c => c.type).entries()]
            .filter(set => !!set[0])
            .map(s => ({ type: s[0], cells: s[1] }));

        const groups = typedCells.map(src => {
            const type = src.type;
            const unvisitedCells = [src.cells];
            const groups = 0;
        });

        return neighbours;
    }
    runV(points: CellPoint[] = this.blankPoints) {
        this.currentDiagram = this.voronoiFunction(points);

        return this;
    }
    // ===================================
}
export default PointGraph;
