import { Delaunay, Voronoi } from 'd3-delaunay';
import { range } from 'd3';
type pt = [number, number];
export class GraphDiagram<T extends XYVector> {
    points: T[];
    delaunayGraph: Delaunay<T>;
    voronoiGraph: Voronoi<T>;
    extent: [number, number, number, number];
    constructor(extent: [number, number, number, number], points: T[]) {
        this.points = points;
        this.delaunayGraph = Delaunay.from(
            this.points,
            p => p.x,
            p => p.y
        );
        this.extent = extent;
        this.voronoiGraph = this.delaunayGraph.voronoi(extent);
    }
    polygon(i: number): GraphDiagram.GraphPolygon<T> {
        return Object.assign(this.voronoiGraph.cellPolygon(i), {
            data: this.points[i]
        }) as GraphDiagram.GraphPolygon<T>;
    }
    neighbors(i: number): T[] {
        return [...this.voronoiGraph.neighbors(i)].map(j => this.points[j]);
    }
    edges() {
        if (this.voronoiGraph.delaunay.hull) return undefined;
        const output: GraphDiagram.edge<T>[] = [];

        for (const i of range(this.delaunayGraph.halfedges.length)) {
            const j = this.delaunayGraph.halfedges[i];

            if (j < i) continue;
            const lhp = this.points[this.delaunayGraph.triangles[i]];
            const rhp = this.points[this.delaunayGraph.triangles[j]];
            const triI = Math.floor(i / 3) * 2;
            const triJ = Math.floor(j / 3) * 2;
            const vxI: pt = [
                this.voronoiGraph.circumcenters[triI],
                this.voronoiGraph.circumcenters[triI + 1]
            ];
            const vxJ: pt = [
                this.voronoiGraph.circumcenters[triJ],
                this.voronoiGraph.circumcenters[triJ + 1]
            ];

            output.push(
                Object.assign([vxI, vxJ] as [pt, pt], {
                    left: lhp,
                    right: rhp
                })
            );
        }

        return output;
    }
}
export default GraphDiagram;

export namespace GraphDiagram {
    type polygon = [number, number][];
    export interface GraphPolygon<T> extends polygon {
        data: T;
    }
    export type edge<T> = [[number, number], [number, number]] & {
        left: T;
        right: T;
    };
}
interface XYVector {
    x: number;
    y: number;
}
declare module 'd3-delaunay' {
    interface Voronoi<P> {
        neighbors(i: number): IterableIterator<number>;
    }
}
