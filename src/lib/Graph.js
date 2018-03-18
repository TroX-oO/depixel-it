//@flow

function findEdge(node: Array<Object>, toId: number) {
  for (let i = 0; i < node.length; ++i) {
    if (node[i].nodeId === toId) {
      return i;
    }
  }
  return -1;
}

let Id = 0;

export default class Graph {
  nodes: Array<{
    edges: Array<Object>,
    corners: Array<Object>,
    rgb: ?Object
  }>;
  id: number;

  constructor(size: number) {
    this.id = ++Id;
    this.nodes = new Array(size);

    for (let i = 0; i < this.nodes.length; ++i) {
      this.nodes[i] = { edges: [], rgb: null, corners: [] };
    }
  }

  addEdge(fromId: number, toId: number, dir: string, data: any) {
    if (this.nodes[fromId] && findEdge(this.nodes[fromId].edges, toId) === -1) {
      this.nodes[fromId].edges.push({ nodeId: toId, dir, data });
    }
    if (this.nodes[toId] && findEdge(this.nodes[toId].edges, fromId) === -1) {
      const invert = dir => {
        if (dir === 'up') return 'down';
        if (dir === 'down') return 'up';
        if (dir === 'left') return 'right';
        if (dir === 'right') return 'left';
        if (dir === 'upright') return 'downleft';
        if (dir === 'upleft') return 'downright';
        if (dir === 'downleft') return 'upright';
        if (dir === 'downright') return 'upleft';
      };
      this.nodes[toId].edges.push({ nodeId: fromId, dir: invert(dir), data });
    }
  }

  removeEdge(fromId: number, toId: number) {
    if (this.nodes[fromId]) {
      const idx = findEdge(this.nodes[fromId].edges, toId);

      if (idx !== -1) {
        console.log('found !');
        this.nodes[fromId].edges.splice(idx, 1);
      }
    }

    if (this.nodes[toId]) {
      const idx = findEdge(this.nodes[toId].edges, fromId);

      if (idx !== -1) {
        console.log('found !');
        this.nodes[toId].edges.splice(idx, 1);
      }
    }
  }

  hasEdge(fromId: number, toId: number) {
    console.log(`hasEdge from ${fromId} to ${toId} ? ${(findEdge(this.nodes[fromId].edges, toId) !== -1).toString()}`);
    return findEdge(this.nodes[fromId].edges, toId) !== -1;
  }

  serialize() {
    for (let i = 0; i < this.nodes.length; ++i) {
      console.log(`Node ${i}`);
      for (let j = 0; j < this.nodes[i].edges.length; ++j) {
        const node = this.nodes[i].edges[j];
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
