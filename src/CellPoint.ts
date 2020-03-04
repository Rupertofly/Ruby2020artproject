import GraphNode from './GraphNode';

// import * as d3 from 'd3';

// =====================================
type cellType = string | undefined;
// =====================================
export class CellPoint {
    x: number;
    y: number;
    vx = 0;
    vy = 0;
    fx?: number;
    fy?: number;

    type: cellType = undefined;
    id?: number;
    group?: number;

    contents?: GraphNode | undefined;
    // ===================================

    private constructor(x: number, y: number, type: string, id?: number) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.id = id;
    }

    // ===================================

    static fromArray(pt: [number, number], type?: cellType, id?: number) {
        return new CellPoint(pt[0], pt[1], type, id);
    }

    static new(x: number, y: number, type: cellType, id: number) {
        return new CellPoint(x, y, type, id);
    }

    static blank(x: number, y: number, id: number) {
        return new CellPoint(x, y, undefined).setID(id);
    }
    get active() {
        return !!this.contents;
    }
    setID(id: number) {
        this.id = id;

        return this;
    }
    // ===================================
}
export default CellPoint;
