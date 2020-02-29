import { Delaunay, Voronoi } from 'd3-delaunay';

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
}
export default GraphDiagram;

export namespace GraphDiagram {
    type polygon = [number, number][];
    export interface GraphPolygon<T> extends polygon {
        data: T;
    }
}
interface XYVector {
    x: number;
    y: number;
}
