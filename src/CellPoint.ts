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

    static newCell(x: number, y: number, type: cellType, id: number) {
        return new CellPoint(x, y, type, id);
    }

    static newBlankCell(x: number, y: number, id: number) {
        return new CellPoint(x, y, undefined).setID(id);
    }
    clone() {
        return Object.assign(
            new CellPoint(this.x, this.y, ''),
            this
        ) as CellPoint;
    }
    get hasNode() {
        return !!this.contents;
    }
    setID(id: number) {
        this.id = id;

        return this;
    }
    setGroup(group: number) {
        this.group = group;

        return this;
    }
    setType(type: string = undefined) {
        this.type = type;

        return this;
    }
    setNode(node: GraphNode) {
        this.contents = node;

        return this;
    }
    clearNode() {
        this.contents = undefined;

        return this;
    }
    forcePosition(x: number, y: number) {
        this.fx = x;
        this.fy = y;

        return this;
    }
    releaseLock() {
        this.fx = undefined;
        this.fy = undefined;

        return this;
    }

    get held() {
        return this.fx || this.fy;
    }
    // ===================================
}
export default CellPoint;
