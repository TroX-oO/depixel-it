import Shape from './Shape';

//@flow

function findEdge(node: Array<Object>, toId: number) {
  for (let i = 0; i < node.length; ++i) {
    if (node[i].nodeId === toId) {
      return i;
    }
  }
  return -1;
}

function findNodeIdx(nodes: Array<Object>, nodeId: number) {
  for (let i = 0; i < nodes.length; ++i) {
    if (nodes[i].id === nodeId) {
      return i;
    }
  }
  return -1;
}

function findCorner(corners: Array<Object>, x: number, y: number) {
  for (let i = 0; i < corners.length; ++i) {
    if (corners[i].x === x && corners[i].y === y) {
      return i;
    }
  }
  return -1;
}

function hasCorner(points, x, y): boolean {
  for (let i = 0; i < points.length; ++i) {
    if (findCorner(points[i].corners, x, y) !== -1) {
      return true;
    }
  }

  return false;
}

let Id = 0;

export default class Graph {
  id: number;
  nodes: Array<{
    id: number,
    edges: Array<Object>,
    corners: Array<Object>,
    rgb: ?Object,
    x: number,
    y: number
  }>;
  width: number;
  height: number;

  constructor(size: number, width: number, height: number) {
    this.id = ++Id;
    this.nodes = new Array(size);
    this.width = width;
    this.height = height;

    for (let i = 0; i < this.nodes.length; ++i) {
      const x = i % width;
      const y = Math.floor(i / width);
      this.nodes[i] = {
        id: i,
        edges: [],
        rgb: null,
        x: -1,
        y: -1,
        corners: [{ x, y }]
      };

      if (x < width) {
        this.nodes[i].corners.push({ x: x + 1, y: y });
      }
      if (y < height) {
        this.nodes[i].corners.push({ x: x, y: y + 1 });
      }

      if (x < width && y < height) {
        this.nodes[i].corners.push({ x: x + 1, y: y + 1 });
      }
    }
  }

  makeGrid(width: number, height: number) {
    const { nodes } = this;

    for (let i = 0; i < nodes.length; ++i) {
      const x = i % (width + 1);
      const y = Math.floor(i / (width + 1));

      nodes[i].x = x;
      nodes[i].y = y;

      nodes[i].corners = [];

      if (x < width) {
        this.addEdge(i, i + 1, 'right');
      }
      if (y < height) {
        this.addEdge(i, i + (width + 1), 'down');
      }
    }
  }

  addNode(x: number, y: number) {
    let n = this.findNode(x, y);

    if (!n) {
      n = { id: this.nodes.length, edges: [], rgb: null, x, y, corners: [] };

      this.nodes.push(n);
    }
    return n;
  }

  removeNode(nodeId: number) {
    const idx = findNodeIdx(this.nodes, nodeId);

    if (idx !== -1) {
      const node = this.nodes[idx];

      while (node.edges.length) {
        this.removeEdge(nodeId, node.edges[0].nodeId);
      }

      this.nodes.splice(idx, 1);
    }
  }

  findNode(x: number, y: number) {
    for (let i = 0; i < this.nodes.length; ++i) {
      if (this.nodes[i].x === x && this.nodes[i].y === y) {
        return this.nodes[i];
      }
    }

    return null;
  }

  getNode(nodeId: number) {
    for (let i = 0; i < this.nodes.length; ++i) {
      if (this.nodes[i].id === nodeId) {
        return this.nodes[i];
      }
    }
    return null;
  }

  addEdge(fromId: number, toId: number, dir: string, data: any) {
    const fromNode = this.getNode(fromId);
    const toNode = this.getNode(toId);

    if (fromNode && findEdge(fromNode.edges, toId) === -1) {
      fromNode.edges.push({ nodeId: toId, dir, data });
    }
    if (toNode && findEdge(toNode.edges, fromId) === -1) {
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
      toNode.edges.push({ nodeId: fromId, dir: invert(dir), data });
    }
  }

  removeEdge(fromId: number, toId: number) {
    const fromNode = this.getNode(fromId);
    const toNode = this.getNode(toId);

    if (fromNode) {
      const idx = findEdge(fromNode.edges, toId);

      if (idx !== -1) {
        fromNode.edges.splice(idx, 1);
      }
    }

    if (toNode) {
      const idx = findEdge(toNode.edges, fromId);

      if (idx !== -1) {
        toNode.edges.splice(idx, 1);
      }
    }
  }

  hasEdge(fromId: number, toId: number) {
    const fromNode = this.getNode(fromId);
    return fromNode && findEdge(fromNode.edges, toId) !== -1;
  }

  removeCorner(nodeId: number, x: number, y: number) {
    const node = this.getNode(nodeId);

    if (node) {
      const idx = findCorner(node.corners, x, y);
      console.log(`removing corner from (${node.x}, ${node.y})  -> (${x}, ${y})   ${JSON.stringify(node.corners)}`);

      if (idx !== -1) {
        console.log('remove corner ok');
        node.corners.splice(idx, 1);
      } else {
        console.log('corner not found');
      }
    }
  }

  addCorner(nodeId: number, x: number, y: number) {
    const node = this.getNode(nodeId);

    if (node) {
      console.log(`Adding corner to (${node.x}, ${node.y})  -> (${x}, ${y})`);
      if (findCorner(node.corners, x, y) === -1) {
        console.log('add corner ok');
        node.corners.push({ x, y });
      }
    }
  }

  shapes(): Array<Shape> {
    const nodes = this.nodes;
    const shapes = [];
    const seen = [];

    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i];

      if (seen.indexOf(node.id) !== -1) {
        continue;
      }

      const shape = new Shape();
      const stack = [node.id];

      seen.push(node.id);
      shape.addPoint(node.x, node.y, node.rgb, node.corners);

      while (stack.length) {
        const id = stack.pop();
        const n = nodes[id];

        for (let j = 0; j < n.edges.length; ++j) {
          const edgeId = n.edges[j].nodeId;
          const edgeNode = nodes[edgeId];

          if (seen.indexOf(edgeId) === -1) {
            stack.push(edgeId);
            seen.push(edgeId);
            shape.addPoint(edgeNode.x, edgeNode.y, edgeNode.rgb, edgeNode.corners);
          }
        }
      }
      console.log(`pushing shape of ${shape.points.length} points`);
      shapes.push(shape);
    }
    console.log(`there is ${shapes.length} shapes`);
    console.log(`there is ${JSON.stringify(shapes, null, 1)} shapes`);
    return shapes;
  }

  subgraph(points: Array<Node>) {
    const sg = new Graph(0, this.width, this.height);

    for (let i = 0; i < this.nodes.length; ++i) {
      const { x, y } = this.nodes[i];

      if (hasCorner(points, x, y)) {
        sg.addNode(x, y);
      }
    }

    for (let i = 0; i < sg.nodes.length; ++i) {
      const { id, x, y } = sg.nodes[i];
      const n = this.findNode(x, y);

      for (let j = 0; j < n.edges.length; ++j) {
        const e = n.edges[j];
        const dest = this.getNode(e.nodeId);
        const sgNode = sg.findNode(dest.x, dest.y);

        if (sgNode) {
          sg.addEdge(id, sgNode.id, e.dir, e.data);
        }
      }
    }

    return sg;
  }

  serialize() {
    // for (let i = 0; i < this.nodes.length; ++i) {
    //   console.log(`Node ${i}`);
    //   for (let j = 0; j < this.nodes[i].edges.length; ++j) {
    //     const node = this.nodes[i].edges[j];
    //     console.log(`  Edge -> ${node.nodeId} ${node.data ? `(${JSON.stringify(node.data)})` : ''}`);
    //   }
    // }

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
