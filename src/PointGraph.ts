import * as d3 from 'd3';
import * as _ from 'lodash';
import CellPoint from './CellPoint';
// =====================================
// Constants

const NUM_POINTS = 200;
const DEF_WID = 600;
const DEF_HEI = 600;

// =====================================
// Helpers

// const { PI, floor: flr } = Math;
const rnd = (e = 1) => Math.random() * e;
// =====================================

export class PointGraph {
  // ===================================

  width = DEF_WID;
  height = DEF_HEI;
  pointsCount = NUM_POINTS;

  blankPoints: CellPoint[] = [];
  populatedPoints: CellPoint[] = [];

  voronoiFunction: d3.VoronoiLayout<CellPoint>;
  forceSim: d3.Simulation<CellPoint, any>;

  // ===================================

  constructor(
    width?: number,
    height?: number,
    points?: number
  ) {
    this.width = width ?? this.width;
    this.height = height ?? this.height;
    this.pointsCount = points ?? this.pointsCount;
    d3.range(this.pointsCount).forEach(() =>
      this.blankPoints.push(
        CellPoint.new(rnd(this.width), rnd(this.height),_.sample(['','','r'])
      )
    ));
    this.voronoiFunction = d3
      .voronoi<CellPoint>()
      .x(d => d.x)
      .y(d => d.y)
      .size([this.width, this.height]);

    this.forceSim = d3.forceSimulation(this.blankPoints);
    this.forceSim.stop();
    this.forceSim.alphaTarget(0.1)
    const PADDING = 0.9;
    const PADinv = 1 - PADDING;
    const mbForce = d3
      .forceManyBody<CellPoint>()
      .strength(d => -3).distanceMax(100)
    const xForce = d3
      .forceX<CellPoint>(this.width / 2)
      .strength(d => {
        const fc =
          Math.abs(d.x - this.width / 2) -
          ((PADinv * (this.width / 2)) / (PADDING/2)) * this.width;
        return fc < 0 ? 0 : fc;
      });
    const yForce = d3
      .forceY<CellPoint>(this.height / 2)
      .strength(d => {
        const fc =
          Math.abs(d.y - this.height / 2) -
          ((PADinv * (this.height / 2)) / (PADDING/2)) * this.height;
        return fc < 0 ? 0 : fc;
      });
    this.forceSim.force('mb',mbForce);
    this.forceSim.force('x',xForce);
    this.forceSim.force('y',yForce);
  }

  // ===================================
}
export default PointGraph;
