//@flow

export type Point = {
  x: number,
  y: number
};

function sortByAngle(x: number, y: number, a: Point, b: Point): number {
  const angleA = Math.atan2(a.y - y, a.x - x);
  const angleB = Math.atan2(b.y - y, b.x - x);

  console.log(
    `angleA (${x}, ${y}) -> (${a.x}, ${a.y}): ${angleA} | angleB (${x}, ${y}) -> (${b.x}, ${b.y}): ${angleB}`
  );
  if (angleA < angleB) {
    return -1;
  }
  if (angleA > angleB) {
    return 1;
  }
  return 0;
}

export default class Node {
  x: number;
  y: number;
  rgb: Object;
  corners: Array<Point>;

  constructor(x: number, y: number, rgb: Object, corners?: Array<Point>) {
    this.x = x;
    this.y = y;
    this.rgb = rgb;
    console.log(' in => ' + JSON.stringify(corners));
    this.corners = corners ? corners.sort(sortByAngle.bind(null, x + 0.5, y + 0.5)) : [];
    console.log(' out => ' + JSON.stringify(this.corners));
  }
}
