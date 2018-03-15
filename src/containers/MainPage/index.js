//@flow

/*
** Imports
*/

import React from 'react';
import { Line } from 'rc-progress';
import styled from 'styled-components';
import DropArea from '../DropArea';
//$FlowFixMe
import Worker from 'worker-loader!../../worker/ImageProcessor.js';

/*
** Types
*/

export type StateTypes = {
  imageData: any,
  progress: ?number,
  processedImage: any
};

/*
** Styled
*/

const Page = styled.div`
  display: block;
  width: 900px;
  text-align: center;
  margin: auto;
`;

const PreviewDrop = styled.div`
  display: inline-block;
  width: 400px;
  height: 400px;
  text-align: center;
  border: 1px solid gray;
  margin: 10px;
`;

const ProcessedArea = styled.div`
  display: inline-block;
  width: 400px;
  height: 400px;
  text-align: center;
  border: 1px solid gray;
  margin: 10px;
  vertical-align: top;
`;

const ProcessedSpriteImage = styled.div`
  width: 200px;
  height: 200px;

  ${props => `background-image: url(${props.src});`};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const Canvas = styled.canvas`
  display: none;
`;

/*
** Component
*/

class MainPage extends React.Component<{}, StateTypes> {
  state = {
    imageData: null,
    progress: null,
    processedImage: null
  };

  worker = new Worker();
  canvas = null;

  onImageLoaded = (image: Object) => {
    this.setState(prevState => ({
      ...prevState,
      imageData: image,
      progress: null
    }));
  };

  processImage = () => {
    const { imageData } = this.state;
    const canvas = this.canvas;

    if (canvas && imageData) {
      const ctx = canvas.getContext('2d');

      canvas.width = imageData.width;
      canvas.height = imageData.height;
      ctx.drawImage(imageData, 0, 0, imageData.width, imageData.height);
      const canvasData = ctx.getImageData(0, 0, imageData.width, imageData.height);

      this.worker.postMessage(canvasData.data);
    } else {
      console.error(`Unable to retrieve context.`);
    }
  };

  onWorkerMessage = (e: any) => {
    const msg = e.data;

    if (msg) {
      switch (msg.type) {
        case 'progress':
          this.setState(prevState => ({
            ...prevState,
            progress: msg.data
          }));
          break;
        case 'done':
          const canvas = this.canvas;
          const { imageData } = this.state;

          if (canvas && imageData) {
            const ctx = canvas.getContext('2d');
            console.log(msg.data);
            console.log(imageData.width, imageData.height);
            const d = new ImageData(msg.data, imageData.width, imageData.height);

            ctx.putImageData(d, 0, 0);

            this.setState(prevState => ({
              ...prevState,
              progress: null,
              processedImage: canvas.toDataURL()
            }));
          }
          break;
        default:
      }
    }
  };

  componentDidMount() {
    this.worker.addEventListener('message', this.onWorkerMessage);
  }

  render() {
    const { imageData, progress, processedImage } = this.state;

    return (
      <Page>
        <PreviewDrop>
          <DropArea onImageLoaded={this.onImageLoaded} />
          <button disabled={!imageData} onClick={this.processImage}>
            Process
          </button>
        </PreviewDrop>
        <ProcessedArea>
          <Canvas innerRef={e => (this.canvas = e)} />
          {progress !== null ? <Line percent={progress} strokeWidth="4" /> : null}
          {processedImage ? <ProcessedSpriteImage src={processedImage} /> : null}
        </ProcessedArea>
      </Page>
    );
  }
}

export default MainPage;
