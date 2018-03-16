//@flow

function findEdge(node: Array<Object>, toId: number) {
  for (let i = 0; i < node.length; ++i) {
    if (node[i].nodeId === toId) {
      return true;
    }
  }
  return false;
}

let Id = 0;

export default class Graph {
  nodes: Array<Array<Object>>;
  id: number;

  constructor(size: number) {
    this.id = ++Id;
    this.nodes = new Array(size);

    for (let i = 0; i < this.nodes.length; ++i) {
      this.nodes[i] = [];
    }
  }

  addEdge(fromId: number, toId: number, dir: string, data: any) {
    if (this.nodes[fromId] && !findEdge(this.nodes[fromId], toId)) {
      this.nodes[fromId].push({ nodeId: toId, dir, data });
      const invert = dir => {
        if (dir === 'up') return 'down';
        if (dir === 'down') return 'up';
        if (dir === 'left') return 'right';
        if (dir === 'right') return 'left';
      };
      this.nodes[toId].push({ nodeId: fromId, dir: invert(dir), data });
    }
  }

  removeEdge(fromId: number, toId: number) {
    if (this.nodes[fromId]) {
      const idx = this.nodes[fromId].indexOf(toId);

      if (idx !== -1) {
        this.nodes[fromId].splice(idx, 1);
      }
    }

    if (this.nodes[toId]) {
      const idx = this.nodes[toId].indexOf(fromId);

      if (idx !== -1) {
        this.nodes[toId].splice(idx, 1);
      }
    }
  }

  serialize() {
    for (let i = 0; i < this.nodes.length; ++i) {
      console.log(`Node ${i}`);
      for (let j = 0; j < this.nodes[i].length; ++j) {
        const node = this.nodes[i][j];
        console.log(`  Edge -> ${node.nodeId} ${node.data ? `(${JSON.stringify(node.data)})` : ''}`);
      }
    }

    return JSON.stringify(this.nodes);
  }

  static unserialize(data: string) {
    const n = JSON.parse(data);
    const g = new Graph(n.length);

    g.nodes = n;

    return g;
  }
}
