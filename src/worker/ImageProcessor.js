//@flow

let intervalId = null;

function onProgress(percent: number) {
  console.log(`post message ${percent}`);
  postMessage({
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

function processImage(binaryData) {
  console.log(binaryData.length);
  for (let i = 0; i < binaryData.length; i += 4) {
    const r = binaryData[i];
    const g = binaryData[i + 1];
    const b = binaryData[i + 2];

    binaryData[i] = colorDistance(noise(), r * 0.393 + g * 0.769 + b * 0.189, r);
    binaryData[i + 1] = colorDistance(noise(), r * 0.349 + g * 0.686 + b * 0.168, g);
    binaryData[i + 2] = colorDistance(noise(), r * 0.272 + g * 0.534 + b * 0.131, b);

    onProgress(Math.floor(i / binaryData.length * 100));
  }
}

function handleMessage(e: any) {
  const binary = e.data;
  console.log('Message received from main script.');
  console.log(e.data);

  processImage(binary);
  postMessage({
    type: 'done',
    data: binary
  });
}

onmessage = handleMessage;
