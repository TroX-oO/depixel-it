import Graph from '../lib/Graph';

//@flow

let intervalId = null;

//$FlowFixMe
const post = postMessage;

function onProgress(percent: number) {
  post({
    type: 'progress',
    data: percent
  });

  if (percent === 100 && intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function noise() {
  return Math.random() * 0.5 + 0.5;
}

function colorDistance(scale, dest, src) {
  for (let i = 0; i < 1000000; ++i) {}
  return scale * dest + (1 - scale) * src;
}

function createSimilarityGraph(data, width, height) {
  const g = new Graph(width * height);

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const current = j * width + i;
      const rgb = {
        r: data[current * 4],
        g: data[current * 4 + 1],
        b: data[current * 4 + 1]
      };

      // We set node color
      g.nodes[current].rgb = rgb;
      // We set corners
      g.nodes[current].corners.push({ x: i, y: j });
      g.nodes[current].corners.push({ x: i + 1, y: j + 1 });
      g.nodes[current].corners.push({ x: i + 1, y: j });
      g.nodes[current].corners.push({ x: i, y: j + 1 });

      // Adding edges to horizontal/vertical neighbours
      if (i < width - 1) {
        // Right
        g.addEdge(current, current + 1, 'right', {
          from: [i, j],
          to: [i + 1, j]
        });

        if (j > 0) {
          // Up Right
          g.addEdge(current, current - width + 1, 'upright', {
            from: [i, j],
            to: [i + 1, j - 1]
          });
        }
        if (j < height - 1) {
          // Down Right
          g.addEdge(current, current + width + 1, 'downright', {
            from: [i, j],
            to: [i + 1, j + 1]
          });
        }
      }
      if (i > 0) {
        // Left
        g.addEdge(current, current - 1, 'left', {
          from: [i, j],
          to: [i - 1, j]
        });

        if (j > 0) {
          // Up Right
          g.addEdge(current, current - width - 1, 'upleft', {
            from: [i, j],
            to: [i - 1, j - 1]
          });
        }
        if (j < height - 1) {
          // Down Left
          g.addEdge(current, current + width - 1, 'downleft', {
            from: [i, j],
            to: [i - 1, j + 1]
          });
        }
      }

      if (j < height - 1) {
        // Down
        g.addEdge(current, current + width, 'down', {
          from: [i, j],
          to: [i, j + 1]
        });
      }
      if (j > 0) {
        // Up
        g.addEdge(current, current - width, 'up', {
          from: [i, j],
          to: [i, j - 1]
        });
      }
      onProgress(Math.floor(current / (height * width) * 100));
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

function removeDissimilarConnectedPixels(graph) {
  const { nodes } = graph;

  for (let i = 0; i < nodes.length; ++i) {
    const edges = nodes[i].edges;
    const yuv1 = toYUV(nodes[i].rgb);

    for (let j = 0; j < edges.length; ++j) {
      const dest = nodes[edges[j].nodeId];
      const yuv2 = toYUV(dest.rgb);

      console.log(yuv2);
      if (
        Math.abs(yuv1.y - yuv2.y) > 48 / 255 ||
        Math.abs(yuv1.u - yuv2.u) > 7 / 255 ||
        Math.abs(yuv1.v - yuv2.v) > 6 / 255
      ) {
        console.log(`removing edges ${i} -> ${edges[j].nodeId}`);
        graph.removeEdge(i, edges[j].nodeId);
        --j;
      }
    }
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

function neighbours(nodeId, width, height) {
  const result = [];
  const i = nodeId % width;
  const j = Math.floor(nodeId / width);

  if (i > 0) {
    result.push(i - 1);

    if (j > 0) {
      result.push(i - 1 - width);
    }

    if (j < height - 1) {
      result.push(i - 1 + width);
    }
  }

  if (i < width - 1) {
    result.push(i + 1);

    if (j > 0) {
      result.push(i + 1 - width);
    }

    if (j < height - 1) {
      result.push(i + 1 + width);
    }
  }

  if (j > 0) {
    result.push(i - width);
  }

  if (j < height - 1) {
    result.push(i + width);
  }
  return result;
}

function getbounds(fromId, toId, width, height) {
  const FrameSize = 8;
  const i1 = fromId % width;
  const j1 = Math.floor(fromId / width);
  const i2 = fromId % width;
  const j2 = Math.floor(fromId / width);
  const xMin = FrameSize / 2 - 1 - Math.min(i1, i2);
  const yMin = FrameSize / 2 - 1 - Math.min(j1, j2);

  return {
    xMin,
    yMin,
    xMax: xMin + FrameSize,
    yMax: yMin + FrameSize
  };
}

function inbounds(bounds, nodeId, width, height) {
  const { xMin, yMin, xMax, yMax } = bounds;
  const i = nodeId % width;
  const j = Math.floor(nodeId / width);

  return i >= xMin && i <= xMax && j >= yMin && j <= yMax;
}

function computeSparseHeuristic(graph, fromId, toId, width, height) {
  const stack = [];
  const component = [`${fromId}-${toId}`];
  const bounds = getbounds(fromId, toId, width, height);

  stack.push(fromId);
  stack.push(toId);

  while (stack.length) {
    const nodeId = stack.pop();

    const neigh = neighbours(nodeId, width, height);

    for (let i = 0; i < neigh.length; ++i) {
      const neighId = neigh[i];

      if (component.indexOf(`${nodeId}-${neighId}`) === -1 && component.indexOf(`${neighId}-${nodeId}`) === -1) {
        // If the node is within the 8x8 bounds
        if (inbounds(bounds, neighId, width, height)) {
          // We add it to the stack
          component.push(`${nodeId}-${neighId}`);
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
  console.error('copmuting heuristic ' + fromId + '-' + toId);
  result += computeCurveHeuristic(graph, fromId, toId, width);
  result += computeSparseHeuristic(graph, fromId, toId, width, height);
  result += computeIslandHeuristic(graph, fromId, toId, width);

  console.log('result: ' + result);
  return result;
}

function mostWeightDiagonals(graph, origin, width, height) {
  const wFirst = computeWeight(graph, origin, origin + width + 1, width, height);
  const wSecond = computeWeight(graph, origin + 1, origin + width, width, height);

  if (wFirst > wSecond) {
    console.error(`winner first`);
    return {
      from: origin + 1,
      to: origin + width
    };
  } else if (wFirst < wSecond) {
    console.error(`winner second`);
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
    console.log(`check diagonal ${i}`);
    console.log(JSON.stringify(nodes[i]));
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
      console.log(`removing diagonals origin ${i}`);
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
      console.log(graph.nodes[i]);
      console.log(graph.nodes[i + 1]);
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
  }
}

function reshape(graph, width, height) {
  const gr = new Graph((width + 1) * (height + 1));
  const { nodes } = graph;

  for (let i = 0; i < nodes.length; ++i) {
    const { edges, rgb: { r, g, b } } = nodes[i];

    gr.nodes[i].rgb = { r, g, b };
    // let x = i % width + 0.5;
    // let y = Math.floor(i / width) + 0.5;

    if (edges.length === 2) {
      for (let j = 0; j < edges.length; ++j) {}
    }
  }

  return gr;
}

function processImage(binaryData, width, height) {
  console.log(binaryData.length);
  const graph = createSimilarityGraph(binaryData, width, height);

  post({
    type: 'step',
    data: {
      type: 'initial',
      graph: graph.serialize()
    }
  });

  removeDissimilarConnectedPixels(graph, width, height);

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
      graph: reshapedGraph.serialize()
    }
  });

  for (let i = 0; i < binaryData.length; i += 4) {
    const r = binaryData[i];
    const g = binaryData[i + 1];
    const b = binaryData[i + 2];

    binaryData[i] = colorDistance(noise(), r * 0.393 + g * 0.769 + b * 0.189, r);
    binaryData[i + 1] = colorDistance(noise(), r * 0.349 + g * 0.686 + b * 0.168, g);
    binaryData[i + 2] = colorDistance(noise(), r * 0.272 + g * 0.534 + b * 0.131, b);

    // onProgress(Math.floor(i / binaryData.length * 100));
  }
}

function handleMessage(e: any) {
  const width = e.data.width;
  const height = e.data.height;
  const binary = e.data.data;
  console.log('Message received from main script.');
  console.log(e.data);

  processImage(binary, width, height);
  post({
    type: 'done',
    data: binary
  });
}

onmessage = handleMessage;
