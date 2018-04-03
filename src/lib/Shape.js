import Node from './Node';

//@flow

export default class Shape {
  points: Array<Node>;

  constructor() {
    this.points = [];
  }

  addPoint(x: number, y: number, rgb: Object, corners: Array<Object>) {
    // We always add the top-left point in first to skip a step in the
    // computation of convex hull
    const p = new Node(x, y, rgb, corners);
    const first = this.points[0];

    if (!first || first.x <= p.x) {
      this.points.push(p);
    } else {
      this.points.unshift(p);
    }
  }

  corners() {
    return Array.prototype.concat(...this.points.map(n => n.corners));
  }

  dump() {
    console.log(`Shape of ${this.points.length} points.`);
    for (let i = 0; i < this.points.length; ++i) {
      const p = this.points[i];

      console.log(`(${p.x}, ${p.y}) rgb: ${JSON.stringify(p.rgb)} corners: ${JSON.stringify(p.corners)}`);
    }
  }
}
