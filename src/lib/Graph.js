//@flow

function findEdge(node: Array<Object>, toId: number) {
  for (let i = 0; i < node.length; ++i) {
    if (node[i].nodeId === toId) {
      return i;
    }
  }
  return -1;
}

function findPath(paths: Array<Object>, x: number, y: number) {
  for (let i = 0; i < paths.length; ++i) {
    if (paths[i].x === x && paths[i].y === y) {
      return i;
    }
  }
  return -1;
}

let Id = 0;

export default class Graph {
  id: number;
  nodes: Array<{
    id: number,
    edges: Array<Object>,
    path: Array<Object>,
    rgb: ?Object,
    x: number,
    y: number
  }>;
  width: number;
  height: number;

  constructor(size: number, width: number, height: number) {
    this.id = ++Id;
    this.nodes = new Array(size);
    this.width = height;
    this.height = height;

    for (let i = 0; i < this.nodes.length; ++i) {
      const x = i % (width + 1);
      const y = Math.floor(i / (width + 1));
      const path = [{ x, y }];

      if (x < width) {
        path.push({ x: x + 1, y: y });
      }
      if (y < height) {
        path.push({ x: x, y: y + 1 });
      }

      if (x < width && y < height) {
        path.push({ x: x + 1, y: y + 1 });
      }
      this.nodes[i] = { id: i, edges: [], rgb: null, x: -1, y: -1, path: path };
    }
  }

  makeGrid(width: number, height: number) {
    const { nodes } = this;

    for (let i = 0; i < nodes.length; ++i) {
      const x = i % (width + 1);
      const y = Math.floor(i / (width + 1));

      nodes[i].x = x;
      nodes[i].y = y;

      nodes[i].path = [{ x, y }];

      console.log(`${x}${y}`);
      if (x < width) {
        this.addEdge(i, i + 1, 'right');
        nodes[i].path.push({ x: x + 1, y: y });
      }
      if (y < height) {
        nodes[i].path.push({ x: x, y: y + 1 });
        this.addEdge(i, i + (width + 1), 'down');
      }

      if (x < width && y < height) {
        nodes[i].path.push({ x: x + 1, y: y + 1 });
      }
    }
  }

  addNode(x: number, y: number) {
    let n = this.findNode(x, y);

    if (!n) {
      n = { id: this.nodes.length, edges: [], rgb: null, x, y, path: [] };

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

  removePath(nodeId: number, x: number, y: number) {
    const node = this.nodes[nodeId];

    if (node) {
      const idx = findPath(node.path, x, y);

      if (idx !== -1) {
        node.path.splice(idx, 1);
      }
    }
  }

  addPath(nodeId: number, x: number, y: number) {
    const node = this.nodes[nodeId];

    if (node) {
      node.path.push({ x, y });
    }
  }

  serialize() {
    for (let i = 0; i < this.nodes.length; ++i) {
      console.log(`Node ${i}`);
      for (let j = 0; j < this.nodes[i].edges.length; ++j) {
        const node = this.nodes[i].edges[j];
        console.log(`  Edge -> ${node.nodeId} ${node.data ? `(${JSON.stringify(node.data)})` : ''}`);
      }
    }

    return JSON.stringify({
      nodes: this.nodes,
      width: this.width,
      height: this.height
    });
  }

  static unserialize(data: string) {
    const d = JSON.parse(data);
    const g = new Graph(d.nodes.length, d.width, d.height);

    g.nodes = d.nodes;

    return g;
  }
}
