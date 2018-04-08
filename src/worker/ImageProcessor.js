import Graph from '../lib/Graph';
import Progressor from '../helpers/Progressor';

//@flow

//$FlowFixMe
const post = postMessage;
let lastProgress = 0;

function onProgress(step?: number, percent?: number) {
  if ((step || step === 0) && (percent || percent === 0)) {
    Progressor.progress(step, percent);
  }
  const p = Progressor.getProgression();

  if (lastProgress !== (step || 1) * p.percent) {
    lastProgress = (step || 1) * p.percent;
    post({
      type: 'progress',
      data: p
    });
  }
}

function createSimilarityGraph(data, width, height) {
  const g = new Graph(width * height, width, height);

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const current = j * width + i;
      const rgb = {
        r: data[current * 4],
        g: data[current * 4 + 1],
        b: data[current * 4 + 2]
      };

      // We set node color
      g.nodes[current].rgb = rgb;
      g.nodes[current].x = i;
      g.nodes[current].y = j;

      // Adding edges to horizontal/vertical neighbours
      if (i < width - 1) {
        // Right
        g.addEdge(current, current + 1, 'right');

        if (j > 0) {
          // Up Right
          g.addEdge(current, current - width + 1, 'upright');
        }
        if (j < height - 1) {
          // Down Right
          g.addEdge(current, current + width + 1, 'downright');
        }
      }
      if (i > 0) {
        // Left
        g.addEdge(current, current - 1, 'left');

        if (j > 0) {
          // Up Right
          g.addEdge(current, current - width - 1, 'upleft');
        }
        if (j < height - 1) {
          // Down Left
          g.addEdge(current, current + width - 1, 'downleft');
        }
      }

      if (j < height - 1) {
        // Down
        g.addEdge(current, current + width, 'down');
      }
      if (j > 0) {
        // Up
        g.addEdge(current, current - width, 'up');
      }
      onProgress(0, Math.floor(current / (height * width - 1) * 100));
    }
  }

  return g;
}

function toYUV(rgb: Object) {
  const y = Math.ceil(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  const u = Math.ceil(rgb.r * -0.168736 + rgb.g * -0.331264 + rgb.b * 0.5 + 128);
  const v = Math.ceil(rgb.r * 0.5 + rgb.g * -0.418688 + rgb.b * -0.081312 + 128);

  return {
    y,
    u,
    v
  };
}

function match(rgb1, rgb2) {
  return matchYUV(rgb1, rgb2);
  // return rgb1.r === rgb2.r && rgb1.g === rgb2.g && rgb1.b === rgb2.b;
}

function matchYUV(rgb1, rgb2) {
  const yuv1 = toYUV(rgb1);
  const yuv2 = toYUV(rgb2);

  return !(Math.abs(yuv1.y - yuv2.y) > 48 || Math.abs(yuv1.u - yuv2.u) > 7 || Math.abs(yuv1.v - yuv2.v) > 6);
}

function removeDissimilarConnectedPixels(graph) {
  const { nodes } = graph;

  for (let i = 0; i < nodes.length; ++i) {
    const { edges, rgb } = nodes[i];
    const yuv1 = toYUV(rgb);

    for (let j = 0; j < edges.length; ++j) {
      const dest = nodes[edges[j].nodeId];
      const yuv2 = toYUV(dest.rgb);

      // console.log(`comparing pixels (${nodes[i].x},${nodes[i].y}) with (${dest.x},${dest.y})`);
      // console.log(`rgb: ${JSON.stringify(nodes[i].rgb)}    ||    rgb: ${JSON.stringify(dest.rgb)}`);
      // console.log(`yuv1: ${JSON.stringify(yuv1)}    ||    yuv2: ${JSON.stringify(yuv2)}`);
      // console.log(`test 1: Math.abs(yuv1.y - yuv2.y) = ${Math.abs(yuv1.y - yuv2.y)} > ${48 / 255}`);
      // console.log(`test 2: Math.abs(yuv1.u - yuv2.u) = ${Math.abs(yuv1.u - yuv2.u)} > ${7 / 255}`);
      // console.log(`test 3: Math.abs(yuv1.v - yuv2.v) = ${Math.abs(yuv1.v - yuv2.v)} > ${6 / 255}`);
      if (Math.abs(yuv1.y - yuv2.y) > 48 || Math.abs(yuv1.u - yuv2.u) > 7 || Math.abs(yuv1.v - yuv2.v) > 6) {
        // console.error('disconnected');
        graph.removeEdge(i, edges[j].nodeId);
        --j;
      }
      // console.log(`======`);
    }
    onProgress(1, Math.floor(i / (nodes.length - 1) * 100));
  }
}

function computeCurveHeuristic(graph, fromId, toId, width) {
  const { nodes } = graph;
  const stack = [];
  const curve = [`${fromId}-${toId}`];

  stack.push(fromId);
  stack.push(toId);

  while (stack.length) {
    const nodeId = stack.pop();
    const { edges } = nodes[nodeId];

    // If we have more or less than 2 edges, then it's not part of a curve
    if (edges.length !== 2) {
      continue;
    }

    for (let i = 0; i < edges.length; ++i) {
      const edge = edges[i];

      // If we have not seen this edge in the curve
      if (curve.indexOf(`${nodeId}-${edge.nodeId}`) === -1 && curve.indexOf(`${edge.nodeId}-${nodeId}`) === -1) {
        // We add it to the stack
        curve.push(`${nodeId}-${edge.nodeId}`);
        stack.push(edge.nodeId);
      }
    }
  }
  return curve.length;
}

function getbounds(fromId, toId, width, height) {
  const FrameSize = 8;
  const x1 = fromId % width;
  const y1 = Math.floor(fromId / width);
  const x2 = toId % width;
  const y2 = Math.floor(toId / width);
  const xMin = -FrameSize / 2 + 1 + Math.min(x1, x2);
  const yMin = -FrameSize / 2 + 1 + Math.min(y1, y2);

  return {
    xMin,
    yMin,
    xMax: xMin + FrameSize,
    yMax: yMin + FrameSize
  };
}

function inbounds(bounds, x, y) {
  const { xMin, yMin, xMax, yMax } = bounds;

  return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
}

function computeSparseHeuristic(graph, fromId, toId, width, height) {
  const stack = [];
  const component = [fromId, toId];
  const bounds = getbounds(fromId, toId, width, height);

  stack.push(fromId);
  stack.push(toId);

  while (stack.length) {
    const nodeId = stack.pop();
    const neigh = graph.nodes[nodeId].edges;

    for (let i = 0; i < neigh.length; ++i) {
      const neighId = neigh[i].nodeId;

      if (component.indexOf(neighId) === -1) {
        // If the node is within the 8x8 bounds
        const node = graph.nodes[neighId];

        if (inbounds(bounds, node.x, node.y)) {
          // We add it to the stack
          component.push(neighId);
          stack.push(neighId);
        }
      }
    }
  }
  return -component.length;
}

function computeIslandHeuristic(graph, fromId, toId, width) {
  const { nodes } = graph;

  if (nodes[fromId].edges.length === 1 || nodes[toId].edges.length === 1) {
    return 5;
  }
  return 0;
}

function computeWeight(graph, fromId, toId, width, height) {
  let result = 0;

  result += computeCurveHeuristic(graph, fromId, toId, width);
  result += computeSparseHeuristic(graph, fromId, toId, width, height);
  result += computeIslandHeuristic(graph, fromId, toId, width);

  return result;
}

function mostWeightDiagonals(graph, origin, width, height) {
  const wFirst = computeWeight(graph, origin, origin + width + 1, width, height);
  const wSecond = computeWeight(graph, origin + 1, origin + width, width, height);

  if (wFirst > wSecond) {
    return {
      from: origin + 1,
      to: origin + width
    };
  } else if (wFirst < wSecond) {
    return {
      from: origin,
      to: origin + width + 1
    };
  }

  return null;
}

function removeDiagonals(graph, width, height) {
  const { nodes } = graph;

  for (let i = 0; i < nodes.length; ++i) {
    // We check if the 2x2 block is fully connected
    // Checking from current to the right/down/downright
    // Checking from current + 1 to down/downleft
    // checking from current + width to right
    if (
      graph.hasEdge(i, i + 1) &&
      graph.hasEdge(i, i + width) &&
      graph.hasEdge(i, i + width + 1) &&
      graph.hasEdge(i + 1, i + width) &&
      graph.hasEdge(i + 1, i + width + 1) &&
      graph.hasEdge(i + width, i + width + 1)
    ) {
      // We remove diagonales
      graph.removeEdge(i, i + width + 1);
      graph.removeEdge(i + 1, i + width);
    } else if (
      !graph.hasEdge(i, i + 1) &&
      !graph.hasEdge(i, i + width) &&
      graph.hasEdge(i, i + width + 1) &&
      graph.hasEdge(i + 1, i + width) &&
      !graph.hasEdge(i + 1, i + width + 1) &&
      !graph.hasEdge(i + width, i + width + 1)
    ) {
      // Diagonals only, we need to resolve ambiguous meaning
      const diag = mostWeightDiagonals(graph, i, width, height);

      if (diag) {
        // We remove the most weighted diag
        graph.removeEdge(diag.from, diag.to);
      } else {
        // If it's a tie, we remove both
        graph.removeEdge(i, i + width + 1);
        graph.removeEdge(i + 1, i + width);
      }
    }
    onProgress(2, Math.floor(i / (nodes.length - 1) * 100));
  }
}

function adjust(graph, gr, adjNodeId, id, px_x, px_y, pn, mpn, npn) {
  graph.removeCorner(adjNodeId, px_x, px_y);
  graph.addCorner(adjNodeId, npn[0], npn[1]);
  graph.addCorner(id, npn[0], npn[1]);

  let mpnNode = gr.findNode(mpn[0], mpn[1]);
  let npnNode = gr.findNode(npn[0], npn[1]);
  let pxNode = gr.findNode(px_x, px_y);

  if (mpnNode) {
    gr.removeEdge(mpnNode.id, pxNode.id);
  } else {
    const pnNode = gr.findNode(pn[0], pn[1]);

    gr.removeEdge(pnNode.id, pxNode.id);
    mpnNode = gr.addNode(mpn[0], mpn[1]);
    gr.addEdge(pnNode.id, mpnNode.id);
  }
  if (!npnNode) {
    npnNode = gr.addNode(npn[0], npn[1]);
  }
  gr.addEdge(mpnNode.id, npnNode.id);
  gr.addEdge(npnNode.id, pxNode.id);
}

function reshape(graph, width, height) {
  const gr = new Graph((width + 1) * (height + 1), width + 1, height + 1);
  const { nodes } = graph;

  gr.makeGrid(width, height);

  for (let i = 0; i < nodes.length; ++i) {
    const { edges, x, y, rgb, id } = nodes[i];

    // we don't process corners
    if (
      (x === 0 && y === 0) ||
      (x === 0 && y === height - 1) ||
      (x === width - 1 && y === 0) ||
      (x === width - 1 && y === height - 1)
    ) {
      continue;
    }

    for (let j = 0; j < edges.length; ++j) {
      const edge = edges[j];
      const to = nodes[edge.nodeId];

      // We check only diagonals
      if (x === to.x || y === to.y) {
        continue;
      }

      const px_x = Math.max(to.x, x);
      const px_y = Math.max(to.y, y);
      const offsetX = to.x - x;
      const offsetY = to.y - y;

      // Adj node = to.x, y
      let adj_node = graph.findNode(to.x, y);

      let pn = null;
      let mpn = null;
      let npn = null;

      if (!match(rgb, adj_node.rgb)) {
        pn = [px_x, px_y - offsetY];
        mpn = [px_x, px_y - 0.5 * offsetY];
        npn = [px_x + 0.25 * offsetX, px_y - 0.25 * offsetY];

        adjust(graph, gr, adj_node.id, id, px_x, px_y, pn, mpn, npn);
      }

      // Adj node = x, to.y
      adj_node = graph.findNode(x, to.y);

      if (!match(rgb, adj_node.rgb)) {
        pn = [px_x - offsetX, px_y];
        mpn = [px_x - 0.5 * offsetX, px_y];
        npn = [px_x - 0.25 * offsetX, px_y + 0.25 * offsetY];

        adjust(graph, gr, adj_node.id, id, px_x, px_y, pn, mpn, npn);
      }
    }
    onProgress(3, Math.floor(i / (nodes.length - 1) * 100));
  }

  // We optimize the graph by removing 2-valences nodes
  const removals = [];

  for (let i = 0; i < gr.nodes.length; ++i) {
    const { edges, x, y, id } = gr.nodes[i];

    if (
      (x === 0 && y === 0) ||
      (x === 0 && y === height) ||
      (x === width && y === 0) ||
      (x === width && y === height)
    ) {
      continue;
    }

    if (edges.length === 2) {
      gr.addEdge(edges[0].nodeId, edges[1].nodeId);
    }
    if (edges.length <= 2) {
      removals.push(id);
    }
  }

  for (let i = 0; i < removals.length; ++i) {
    gr.removeNode(removals[i]);
  }

  // Copying corners
  for (let i = 0; i < nodes.length; ++i) {
    const clone = JSON.parse(JSON.stringify(nodes[i].corners));

    for (let j = 0; j < clone.length; ++j) {
      if (!gr.findNode(clone[j].x, clone[j].y)) {
        graph.removeCorner(i, clone[j].x, clone[j].y);
      }
    }
  }
  onProgress(3, 100);

  return gr;
}

function getVisibleEdgesGraph(reshape, graph) {
  const { nodes } = graph;

  for (let i = 0; i < nodes.length; ++i) {
    const { edges, corners } = nodes[i];

    for (let j = 0; j < edges.length; ++j) {
      const edgeNode = nodes[edges[j].nodeId];

      const intersection = corners.filter(c => edgeNode.corners.some(c2 => c.x === c2.x && c.y === c2.y));

      if (intersection.length !== 2) {
        console.error(`we migth have a conflict here ${JSON.stringify(intersection)}`);
        console.log(`(${nodes[i].x},${nodes[i].y}) ${JSON.stringify(corners)}`);
        console.log(`(${edgeNode.x},${edgeNode.y}) ${JSON.stringify(edgeNode.corners)}`);
      } else {
        const n1 = reshape.findNode(intersection[0].x, intersection[0].y);
        const n2 = reshape.findNode(intersection[1].x, intersection[1].y);

        if (n1 && n2 && reshape.hasEdge(n1.id, n2.id)) {
          reshape.removeEdge(n1.id, n2.id);
        }
      }
    }
    onProgress(4, Math.floor(i / (nodes.length - 1) * 100));
  }

  for (let i = 0; i < reshape.nodes.length; ++i) {
    const { id, edges } = reshape.nodes[i];

    if (edges.length === 0) {
      reshape.removeNode(id);
      --i;
    }
  }

  return reshape;
}

function createShapePath(shapes, outlines) {
  // for (let i = 0; i < shapes.length; ++i) {
  //   const shape = shapes[i];
  //   const sg = outlines.subgraph(shape.points);

  //   post({
  //     type: 'step',
  //     data: {
  //       type: 'reshaped',
  //       graph: sg.serialize()
  //     }
  //   });
  // }
  const paths = {};
  const { nodes } = outlines;
}

function processImage(binaryData, width, height) {
  const graph = createSimilarityGraph(binaryData, width, height);

  post({
    type: 'step',
    data: {
      type: 'initial',
      graph: graph.serialize()
    }
  });

  removeDissimilarConnectedPixels(graph);

  post({
    type: 'step',
    data: {
      type: 'initial',
      graph: graph.serialize()
    }
  });

  removeDiagonals(graph, width, height);

  post({
    type: 'step',
    data: {
      type: 'initial',
      graph: graph.serialize()
    }
  });

  const reshapedGraph = reshape(graph, width, height);

  post({
    type: 'step',
    data: {
      type: 'initial',
      graph: graph.serialize()
    }
  });

  const serializedReshape = reshapedGraph.serialize();
  post({
    type: 'step',
    data: {
      type: 'reshaped',
      graph: serializedReshape
    }
  });

  const reshapeCopy = Graph.unserialize(serializedReshape);
  const outlines = getVisibleEdgesGraph(reshapeCopy, graph);

  post({
    type: 'step',
    data: {
      type: 'reshaped',
      graph: outlines.serialize()
    }
  });

  post({
    type: 'step',
    data: {
      type: 'shapes',
      graph: graph.serialize()
    }
  });

  const shapes = graph.shapes();

  createShapePath(shapes, outlines);

  // post({
  //   type: 'step',
  //   data: {
  //     type: 'svg',
  //     graph: outlines.serialize()
  //   }
  // });

  // post({
  //   type: 'step',
  //   data: {
  //     type: 'shapes',
  //     graph: outlines.serialize()
  //   }
  // });
}

function handleMessage(e: any) {
  const width = e.data.width;
  const height = e.data.height;
  const binary = e.data.data;
  console.log('Message received from main script.');
  console.log(e.data);

  lastProgress = 0;
  Progressor.reset();

  processImage(binary, width, height);

  Progressor.done();
  onProgress();
}

onmessage = handleMessage;
