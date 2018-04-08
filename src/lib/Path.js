export default class Path {
  constructor() {
    this.path = [];
  }

  append(x, y) {
    this.path.push({ x, y });
  }

  dump() {
    console.log(this.path.map(n => `(${n.x}, ${n.y})`).join(' -> '));
  }
}
