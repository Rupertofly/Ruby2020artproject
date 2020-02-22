// import * as d3 from 'd3';

// =====================================


// =====================================
export class CellPoint {
  x:number;
  y:number;
  type:string;
  id?: string;
  group?: number;

  // ===================================

  private constructor(x:number,y:number,type:string,id?:string) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.id = id;
  }

  // ===================================

  static fromArray(pt:[number,number],type:string,id?:string) {
    return new CellPoint(pt[0],pt[1],type,id)
  }

  static new(x:number,y:number,type:string,id?:string) {
    return new CellPoint(x,y,type,id)
  }

  static blank(x:number,y:number) {
    return new CellPoint(x,y,'');
  }
  // ===================================

}
export default CellPoint;