import * as d3 from 'd3';
import * as _ from 'lodash';
import CellPoint from './CellPoint';
import GraphDiagram from './GraphDiagram';
import DisjointSet from './disjointset';

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
const random = (e = 1) => Math.random() * e;

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
/**
 * Class to manage the layout and grouping of points
 */
export class PointGraph {
    // ===================================
    /** Graph Width */
    width = DEF_WID;
    /** Graph Height */
    height = DEF_HEI;
    /** Number of points */
    pointsCount = NUM_POINTS;

    blankPoints: CellPoint[] = [];
    populatedPoints: CellPoint[] = [];

    // voronoiFunction: d3.VoronoiLayout<CellPoint>;
    currentDiagram: GraphDiagram<CellPoint>;
    forceSim: d3.Simulation<CellPoint, any>;

    // ===================================

    /**
     * Creates an instance of point graph.
     * @param width - width of graph
     * @param height - height of graph
     * @param points - number of points to generate
     */
    constructor(width?: number, height?: number, points?: number) {
        this.width = width ?? this.width;
        this.height = height ?? this.height;
        this.pointsCount = points ?? this.pointsCount;
        d3.range(this.pointsCount).forEach(i =>
            this.blankPoints.push(
                CellPoint.new(
                    random(this.width),
                    random(this.height),
                    _.sample([undefined, undefined, undefined, `red`, 'blue']),
                    i
                )
            )
        );
        this.currentDiagram = new GraphDiagram(
            [0, 0, this.width, this.height],
            this.blankPoints,
            1
        );
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
        const lloydForce: d3.Force<CellPoint, any> = alpha => {
            const arr = this.currentDiagram || this.runVoronoi().currentDiagram;

            this.blankPoints.map((polygon, i) => {
                const [cx, cy] = d3.polygonCentroid(
                    this.currentDiagram.polygon(i)
                );

                polygon.vx -= (polygon.x - cx) * alpha * 0.1;
                polygon.vy -= (polygon.y - cy) * alpha * 0.1;
            });
        };
        const collideForce = d3
            .forceCollide<CellPoint>()
            .radius((d, i) => (d.type ? (i % 16 === 0 ? 60 : 5) : 0));

        this.forceSim.force(`collision`, collideForce);
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
        this.forceSim.force(`spacing`, lloydForce);
    }
    getRegionHulls() {
        const type = group(this.blankPoints, p => p.type);
    }
    groupCells(cells: CellPoint[] = this.blankPoints) {
        const cellSet = [...cells];
        const neighbours = cellSet.map((currentCell, i) => ({
            currentCell,
            nbs: this.currentDiagram.neighbors(i)
        }));
        const typedCells = [...group(cellSet, c => c.type).entries()]
            .filter(set => !!set[0])
            .map(s => ({ type: s[0], cells: s[1] }));

        const groups = typedCells.map(src => {
            const type = src.type;
            const unvisitedCells = [...src.cells];
            const dsjSet = new DisjointSet(unvisitedCells, d => d.id);

            unvisitedCells.map(cp => {
                const cpID = cp.id;

                neighbours[cpID].nbs.map(nb => {
                    if (nb.type === type && nb.id > cpID)
                        dsjSet.union(cpID, nb.id);
                });
            });

            return { type, groups: dsjSet.groups() };
        });

        return groups;
    }
    runVoronoi(points: CellPoint[] = this.blankPoints) {
        this.currentDiagram.updatePoints(points);

        return this;
    }
    // ===================================
}
export default PointGraph;
