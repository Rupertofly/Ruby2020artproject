import cellPoint from './CellPoint';
import GD from './GraphDiagram';
function matchNum(a: number, b: number) {
    const EPSILON = 1e-9;

    return Math.abs(a - b) < EPSILON;
}

type point = [number, number];
type cellEdge = GD.edge<cellPoint>;
type loop = point[];

function matchPoint(a: point, b: point) {
    return matchNum(a[0], b[0]) && matchNum(a[1], b[1]);
}
