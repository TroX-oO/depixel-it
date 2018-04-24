import bspline from 'b-spline';

let degree = 2;

export default class Path {
  constructor() {
    this.cp = [];
  }

  append(x, y) {
    this.cp.push([x, y]);
  }

  static toSvgPath(controls, factor) {
    let cp = JSON.parse(JSON.stringify(controls));

    if (!cp.length) {
      return '';
    }

    if (cp.length === 2) {
      return this.toSvgPathLine(cp, factor);
    }

    let p = '';
    factor = factor || 1;

    let knots = [];

    if (cp[0][0] === cp[cp.length - 1][0] && cp[0][1] === cp[cp.length - 1][1]) {
      // closed
      cp.push(cp[1]);
      cp.push(cp[2]);
      cp.push(cp[3]);

      for (let i = 0; i < cp.length + degree + 1; ++i) {
        knots.push(i);
      }
      // knots = null;
    } else {
      // clamped
      cp.unshift(cp[0]);
      cp.push(cp[cp.length - 1]);

      for (let i = 0; i < cp.length - 1; ++i) {
        knots.push(i);
      }
      knots.unshift(0);
      knots.unshift(0);
      knots.push(cp.length - 1);
      knots.push(cp.length - 1);
    }

    let point = bspline(0, degree, cp, knots);
    p += `M${point[0] * factor},${point[1] * factor} `;

    for (let i = 0.001; i < 1; i += 0.001) {
      point = bspline(i, degree, cp, knots);
      p += `L${point[0] * factor},${point[1] * factor} `;
    }

    point = bspline(1, degree, cp, knots);
    p += `L${point[0] * factor},${point[1] * factor}`;

    return p;
  }

  static toSvgPathLine(cp, factor) {
    if (!cp.length) {
      return '';
    }

    let p = '';
    factor = factor || 1;

    if (cp.length > 1) {
      p += `M${cp[0][0] * factor},${cp[0][1] * factor} `;

      for (let i = 1; i < cp.length; ++i) {
        p += `L${cp[i][0] * factor},${cp[i][1] * factor} `;
      }
    }

    return p;
  }

  dump() {
    console.log(this.cp.map(n => `(${n[0]}, ${n[1]}) `).join(' -> '));
  }
}
