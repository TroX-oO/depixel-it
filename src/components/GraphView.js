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

  updateCanvas() {
    const { graph, width, height, lattice } = this.props;
    const ctx = this.canvas.getContext('2d');
    console.error('lattice: ' + (graph ? graph.id : 'nulll'));

    ctx.clearRect(0, 0, width + 2 * Margin, height + 2 * Margin);

    if (graph) {
      console.log(graph.id);
      const { nodes } = graph;
      const factor = 40;

      for (let i = 0; i < nodes.length; ++i) {
        const { rgb, x, y } = nodes[i];
        if (rgb) {
          ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        } else {
          ctx.fillStyle = `white`;
        }
        ctx.fillRect(x * factor + Margin, y * factor + Margin, factor, factor);
      }

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

        for (let j = 0; j < corners.length; ++j) {
          ctx.beginPath();
          ctx.arc(corners[j].x * factor + Margin, corners[j].y * factor + Margin, 4, 0, Math.PI * 2, true);
          ctx.fillStyle = `green`;
          ctx.fill();
        }
      }
    }
  }

  render() {
    const { graph, width, height } = this.props;
    const cwidth = (graph ? graph.width * 40 : width) + 2 * Margin;
    const cheight = (graph ? graph.height * 40 : height) + 2 * Margin;

    return (
      <Area width={width} height={height}>
        <canvas ref={ref => (this.canvas = ref)} width={cwidth} height={cheight} />
      </Area>
    );
  }
}

export default GraphView;
