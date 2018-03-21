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
  graph: Graph
};

const ContainerWidth = 400;
const ContainerHeight = 400;
const Margin = 10;

/*
 ** Styled
 */

const Area = styled.div`
  position: relative;
  display: block;
  text-align: left;
  margin: auto;
  width: 650px;
  height: 650px;
  overflow: scroll;
`;

/*
** Component
*/

class LatticeGraphView extends React.Component<PropTypes, null> {
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

  componentWillReceiveProps() {
    this.updateCanvas();
  }

  updateCanvas() {
    const { graph, width, height } = this.props;
    const rw = Math.ceil(ContainerWidth / width);
    const rh = Math.ceil(ContainerHeight / height);
    const factor = Math.min(rw, rh);
    const ctx = this.canvas.getContext('2d');

    ctx.clearRect(0, 0, ContainerWidth + Margin, ContainerHeight + Margin);

    if (graph) {
      const { nodes } = graph;

      for (let i = 0; i < nodes.length; ++i) {
        const { edges, rgb, x, y } = nodes[i];
        ctx.beginPath();
        ctx.arc(x * factor + Margin, y * factor + Margin, 5, 0, Math.PI * 2, true);
        if (rgb) {
          ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        }
        ctx.fill();

        for (let j = 0; j < edges.length; ++j) {
          const dest = graph.getNode(edges[j].nodeId);
          ctx.beginPath();
          ctx.moveTo(x * factor + Margin, y * factor + Margin);
          ctx.lineTo(dest.x * factor + Margin, dest.y * factor + Margin);
          ctx.stroke();
        }
      }
    }
  }

  render() {
    return (
      <Area>
        <canvas
          ref={ref => (this.canvas = ref)}
          width={ContainerWidth + 2 * Margin}
          height={ContainerHeight + 2 * Margin}
        />
      </Area>
    );
  }
}

export default LatticeGraphView;
