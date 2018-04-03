//@flow

/*
 ** Imports
 */

import React from 'react';
import styled from 'styled-components';
import Graph from '../lib/Graph';

/*
 ** Types
 */

type PropTypes = {
  width: number,
  height: number,
  lattice?: boolean,
  cornered?: boolean,
  graph: ?Graph
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

function getRandomColor(x, y) {
  var letters = '456789ABCDEF0123';
  var color = '#';
  color += letters[Math.floor((1000 * (x * x + y * y)) % 16)];
  color += letters[Math.floor((100 * (x + y * y)) % 16)];
  color += letters[Math.floor((25 * (x * x + y)) % 16)];
  color += letters[Math.floor((17 * (x * x * x + y * y)) % 16)];
  color += letters[Math.floor((276 * (x * x + y * y * y)) % 16)];
  color += letters[Math.floor((826 * (x * x + y * y)) % 16)];
  return color;
}

class GraphView extends React.Component<PropTypes, null> {
  canvas: any;

  constructor() {
    super();
    this.canvas = null;
  }

  shouldComponentUpdate(nextProps: PropTypes) {
    return nextProps.graph && this.props.graph ? nextProps.graph.id !== this.props.graph.id : true;
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

  drawPixels(ctx: Object, nodes: Array<Object>, factor: number) {
    for (let i = 0; i < nodes.length; ++i) {
      const { rgb, x, y } = nodes[i];
      if (rgb) {
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      } else {
        ctx.fillStyle = `white`;
      }
      ctx.fillRect(x * factor + Margin, y * factor + Margin, factor, factor);
    }
  }

  updateCanvas() {
    const { graph, width, height, lattice } = this.props;
    const ctx = this.canvas.getContext('2d');

    ctx.clearRect(0, 0, width + 2 * Margin, height + 2 * Margin);

    if (graph) {
      const { nodes } = graph;
      const factor = this.factor();

      this.drawPixels(ctx, nodes, factor);

      for (let i = 0; i < nodes.length; ++i) {
        const { edges, corners, rgb, x, y } = nodes[i];
        ctx.beginPath();
        if (lattice) {
          ctx.arc(x * factor + Margin, y * factor + Margin, 5, 0, Math.PI * 2, true);
          if (rgb) {
            ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
          } else {
            ctx.fillStyle = `black`;
          }
        } else {
          ctx.arc(x * factor + Margin + factor / 2, y * factor + Margin + factor / 2, 5, 0, Math.PI * 2, true);
          ctx.fillStyle = `black`;
        }
        ctx.fill();

        for (let j = 0; j < edges.length; ++j) {
          const dest = graph.getNode(edges[j].nodeId);
          ctx.beginPath();
          if (lattice) {
            ctx.moveTo(x * factor + Margin, y * factor + Margin);
            ctx.lineTo(dest.x * factor + Margin, dest.y * factor + Margin);
          } else {
            ctx.moveTo(x * factor + Margin + factor / 2, y * factor + Margin + factor / 2);
            ctx.lineTo(dest.x * factor + Margin + factor / 2, dest.y * factor + Margin + factor / 2);
          }
          ctx.strokeStyle = 'rgb(150, 50, 50)';
          ctx.stroke();
        }

        const color = getRandomColor(x, y);

        for (let j = 0; j < corners.length; ++j) {
          let posX = corners[j].x * factor + Margin;
          let posY = corners[j].y * factor + Margin;

          if (x + 0.5 < corners[j].x) {
            posX -= 0.12 * factor;
          }
          if (y + 0.5 < corners[j].y) {
            posY -= 0.12 * factor;
          }

          ctx.fillStyle = color;
          ctx.fillRect(posX, posY, 0.12 * factor, 0.12 * factor);
        }
      }
    }
  }

  factor() {
    const { graph, width, height, lattice } = this.props;

    if (graph) {
      const extra = lattice ? 0 : 1;
      return Math.floor(Math.min(width / (graph.width + extra), height / (graph.height + extra)));
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

export default GraphView;
