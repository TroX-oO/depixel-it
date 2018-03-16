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

      // Adding edges to horizontal/vertical neighbours
      if (i < width - 1) {
        g.addEdge(current, current + 1, 'right', {
          from: [i, j],
          to: [i + 1, j]
        });
      }
      if (i > 0) {
        g.addEdge(current, current - 1, 'left', {
          from: [i, j],
          to: [i - 1, j]
        });
      }

      if (j < height - 1) {
        g.addEdge(current, current + width, 'down', {
          from: [i, j],
          to: [i, j + 1]
        });
      }
      if (j > 0) {
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
