//@flow

/*
 ** Imports
 */

import React from 'react';
import styled from 'styled-components';
import Shape from '../lib/Shape';
import Graph from '../lib/Graph';

/*
 ** Types
 */

type PropTypes = {
  width: number,
  height: number,
  graph: Graph,
  shapes: Array<Shape>
};

const Margin = 10;

/*
 ** Styled
 */

const Area = styled.div`
  position: relative;
  display: block;
  text-align: left;
  margin: auto;
  ${props => `width: ${props.width}px;`};
  ${props => `height: ${props.height}px;`};
  overflow: scroll;
`;

/*
** Component
*/

class ShapesView extends React.Component<PropTypes, null> {
  canvas: any;

  constructor() {
    super();
    this.canvas = null;
  }

  componentDidMount() {
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  componentWillUnmount() {
    const { width, height } = this.props;

    if (this.canvas) {
      const ctx = this.canvas.getContext('2d');

      ctx.clearRect(0, 0, width + 2 * Margin, height + 2 * Margin);
    }
  }

  drawShape(ctx: Object, shape: Shape, factor: number) {
    for (let i = 0; i < shape.points.length; ++i) {
      const { rgb, corners } = shape.points[i];

      if (rgb) {
        console.log(`rgb shape: ${JSON.stringify(rgb)}`);
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      } else {
        console.log(`rgb shape: white`);
        ctx.fillStyle = `white`;
      }

      if (corners.length) {
        ctx.beginPath();
        ctx.moveTo(corners[0].x * factor + Margin, corners[0].y * factor + Margin);
        console.log('drawing shape');
        console.log(`${JSON.stringify(corners[0])}`);

        for (let j = 1; j < corners.length; ++j) {
          const { x, y } = corners[j];

          console.log(`${JSON.stringify(corners[j])}`);
          ctx.lineTo(x * factor + Margin, y * factor + Margin);
        }
        ctx.closePath();
        console.log('done');
        ctx.fill();
      }
    }
  }

  updateCanvas() {
    const { shapes, width, height } = this.props;
    const ctx = this.canvas.getContext('2d');

    ctx.clearRect(0, 0, width + 2 * Margin, height + 2 * Margin);

    const factor = this.factor();

    for (let i = 0; i < shapes.length; ++i) {
      this.drawShape(ctx, shapes[i], factor);
    }
  }

  factor() {
    const { graph, width, height } = this.props;

    if (graph) {
      return Math.floor(Math.min(width / (graph.width + 1), height / (graph.height + 1)));
    } else {
      return 1;
    }
  }

  render() {
    const { graph, width, height } = this.props;
    const factor = this.factor();
    const cwidth = (graph ? graph.width * factor : width) + 2 * Margin;
    const cheight = (graph ? graph.height * factor : height) + 2 * Margin;

    return (
      <Area width={width} height={height}>
        <canvas ref={ref => (this.canvas = ref)} width={cwidth} height={cheight} />
      </Area>
    );
  }
}

export default ShapesView;
