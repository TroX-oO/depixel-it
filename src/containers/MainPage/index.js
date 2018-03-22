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
// import ProgressArea from '../ProgressArea';
import Graph from '../../lib/Graph';
import LatticeGraphView from '../../components/LatticeGraphView';
import StepView from '../StepView';
import Progressor from '../../helpers/Progressor';
import Header from '../../components/Header';

/*
** Types
*/

export type StateTypes = {
  imageData: any,
  progress: ?number,
  processedImage: any,
  steps: Array<{
    type: string,
    g: Graph
  }>,
  initialGraph: ?Graph,
  reshapedGraph: ?Graph
};

/*
** Styled
*/

const Page = styled.div`
  display: block;
  width: 1200px;
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
  padding: 10px;
`;

// const ProgressView = styled(ProgressArea)`
//   display: inline-block;
//   width: 700px;
//   height: 700px;
//   text-align: center;
//   border: 1px solid gray;
//   margin: 10px;
//   vertical-align: bottom;
//   padding: 10px;
// `;

const StepViewWrapper = styled(StepView)`
  display: inline-block;
  width: 700px;
  height: 700px;
  text-align: center;
  border: 1px solid gray;
  margin: 10px;
  vertical-align: bottom;
  padding: 10px;
`;

const ProcessedArea = styled.div`
  display: inline-block;
  width: 1160px;
  height: 1160px;
  text-align: center;
  border: 1px solid gray;
  margin: 10px;
  vertical-align: top;
  padding: 10px;
  box-sizing: border-box;
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
    progression: null,
    processedImage: null,
    steps: [],
    initialGraph: null,
    reshapedGraph: null
  };

  worker = new Worker();
  canvas = null;

  onImageLoaded = (image: Object) => {
    this.setState(prevState => ({
      ...prevState,
      imageData: image,
      steps: [],
      progress: null
    }));
  };

  processImage = () => {
    const { imageData } = this.state;
    const canvas = this.canvas;

    if (canvas && imageData) {
      const ctx = canvas.getContext('2d');
      const width = imageData.width;
      const height = imageData.height;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(imageData, 0, 0, width, height);
      const canvasData = ctx.getImageData(0, 0, width, height);

      this.setState(prevState => ({
        ...prevState,
        progression: null
      }));

      this.worker.postMessage({
        width,
        height,
        data: canvasData.data
      });
    } else {
      console.error(`Unable to retrieve context.`);
    }
  };

  onWorkerMessage = (e: any) => {
    const msg = e.data;
    const { imageData } = this.state;

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
        case 'step':
          const graphType = msg.data.type;

          if (graphType === 'initial' && imageData) {
            const g = Graph.unserialize(msg.data.graph);

            this.setState(prevState => ({
              ...prevState,
              steps: [...prevState.steps, { type: graphType, g: g }],
              initialGraph: g
            }));
          } else if (graphType === 'reshaped' && imageData) {
            const g = Graph.unserialize(msg.data.graph);

            this.setState(prevState => ({
              ...prevState,
              steps: [...prevState.steps, { type: graphType, g: g }],
              reshapedGraph: g
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
    const { imageData, progress, processedImage, reshapedGraph, steps } = this.state;

    return (
      <Page>
        <Header />
        <PreviewDrop>
          <DropArea onImageLoaded={this.onImageLoaded} />
          <button disabled={!imageData} onClick={this.processImage}>
            Process
          </button>
          <Line percent={progress} />
        </PreviewDrop>
        <StepViewWrapper steps={steps} />
        <LatticeGraphView graph={reshapedGraph} />
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
