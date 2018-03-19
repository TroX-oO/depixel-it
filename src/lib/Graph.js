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
    rgb: ?Object,
    x: number,
    y: number
  }>;
  id: number;

  constructor(size: number) {
    this.id = ++Id;
    this.nodes = new Array(size);

    for (let i = 0; i < this.nodes.length; ++i) {
      this.nodes[i] = { id: i, edges: [], rgb: null, x: -1, y: -1 };
    }
  }

  makeGrid(width: number, height: number) {
    const { nodes } = this;

    for (let i = 0; i < nodes.length; ++i) {
      const x = i % (width + 1);
      const y = Math.floor(i / (width + 1));

      console.log(`${x}${y}`);
      if (x < width) {
        console.log(` -> adding right`);
        this.addEdge(i, i + 1, 'right');
      }
      if (y < height) {
        console.log(` -> adding down`);
        this.addEdge(i, i + (width + 1), 'down');
      }
    }
  }

  addNode(x: number, y: number) {
    let n = this.findNode(x, y);

    if (!n) {
      n = { id: this.nodes.length, edges: [], rgb: null, x, y };

      this.nodes.push(n);
    }
    return n;
  }

  findNode(x: number, y: number) {
    for (let i = 0; i < this.nodes.length; ++i) {
      if (this.nodes[i].x === x && this.nodes[i].y === y) {
        return this.nodes[i];
      }
    }

    return null;
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
        this.nodes[fromId].edges.splice(idx, 1);
      }
    }

    if (this.nodes[toId]) {
      const idx = findEdge(this.nodes[toId].edges, fromId);

      if (idx !== -1) {
        this.nodes[toId].edges.splice(idx, 1);
      }
    }
  }

  hasEdge(fromId: number, toId: number) {
    // console.log(`hasEdge from ${fromId} to ${toId} ? ${(findEdge(this.nodes[fromId].edges, toId) !== -1).toString()}`);
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
