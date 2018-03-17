//@flow

/*
 ** Imports
 */

import React from 'react';
import { Motion } from 'react-motion';
import styled, { css } from 'styled-components';
import Graph from '../lib/Graph';

/*
 ** Types
 */

type PropTypes = {
  width: number,
  height: number,
  graph: Graph
};

/*
 ** Styled
 */

const Area = styled.div`
  position: relative;
  display: block;
  text-align: center;
  margin: auto;
  width: 650px;
  height: 650px;
  overflow: scroll;
`;

const Grid = styled.table`
  border-collapse: collapse;
  ${props => {
    return css`
      width: ${props.width}px;
      height: ${props.height}px;
    `;
  }};
  z-index: 0;
`;

const Row = styled.tr``;
const Cell = styled.td`
  border: 1px solid black;
  ${props => {
    if (props.rgb) {
      const { r, g, b } = props.rgb;
      return css`
        background-color: rgba(${r}, ${g}, ${b}, 0.5);
      `;
    }
  }};
`;

const Node = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  text-align: center;
  margin: auto;
  width: 10px;
  height: 10px;
  line-height: 10px;
  border-radius: 10px;
  background: black;
  color: white;
  ${props => `transform: translate3d(${props.tx}px, ${props.ty}px, 0);`};
`;

const Edge = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 2px;
  background-color: black;
  ${props => {
    let tx = 0;
    let ty = 4;
    let rotate = 0;
    let w = 35;

    if (props.dir === 'up') {
      rotate = 90;
      tx = -12;
      ty = -14;
    } else if (props.dir === 'down') {
      rotate = 90;
      tx = -12;
      ty = 20;
    } else if (props.dir === 'left') {
      tx -= 30;
    } else if (props.dir === 'right') {
      tx += 10;
    } else if (props.dir === 'upright') {
      rotate = -45;
      tx = -5;
      ty = -11;
      w = 50;
    } else if (props.dir === 'upleft') {
      rotate = 45;
      tx = -36;
      ty = -14;
      w = 50;
    } else if (props.dir === 'downleft') {
      rotate = -45;
      tx = -36;
      ty = 20;
      w = 50;
    } else if (props.dir === 'downright') {
      rotate = 45;
      tx = 0;
      ty = 22;
      w = 50;
    }
    const tr = `translate3d(${tx}px, ${ty}px, 0)`;

    return `
      transform: ${tr}${rotate ? ` rotateZ(${rotate}deg)` : ''};
      width: ${w}px;
    `;
  }};
`;
/*
** Component
*/

class GraphView extends React.Component<PropTypes, null> {
  canvas = null;

  shouldComponentUpdate(nextProps: PropTypes) {
    return nextProps.graph && this.props.graph ? nextProps.graph.id !== this.props.graph.id : true;
  }

  renderNodeAndEdges(idx: number, style: Object) {
    const { graph } = this.props;
    const n = graph && graph.nodes[idx];

    if (n) {
      return (
        <Node tx={style.translateX} ty={style.translateY}>
          {n.edges.map(edge => {
            return <Edge key={`edge-${idx}-${edge.nodeId}`} dir={edge.dir} />;
          })}
        </Node>
      );
    } else {
      return null;
    }
  }

  renderGraph() {
    const { graph, width, height } = this.props;

    if (graph) {
      const { nodes } = graph;
      const jsx = [];
      let row = null;

      for (let i = 0; i < nodes.length; ++i) {
        const j = i % height;

        if (j === 0) {
          if (row) {
            jsx.push(row);
          }
          row = [];
        }

        const x = i % width;
        const y = Math.floor(i / width);

        const style = {
          translateX: x * 36 + 18 - 5,
          translateY: y * 36 + 18 - 5
        };

        const n = (
          <Motion key={`node-${i}`} style={style}>
            {this.renderNodeAndEdges.bind(this, i)}
          </Motion>
        );

        if (row) {
          row.push(n);
        }
      }
      jsx.push(row);
      return jsx;
    }

    return null;
  }

  renderGrid() {
    const { graph, width, height } = this.props;

    if (graph) {
      const { nodes } = graph;
      const jsx = [];
      let row = null;

      for (let i = 0; i < nodes.length; ++i) {
        const j = i % width;
        const node = nodes[i];

        if (j === 0) {
          if (row) {
            jsx.push(<Row key={`row-${j}-${i}`}>{row}</Row>);
          }
          row = [];
        }
        const n = <Cell key={`node-${i}`} rgb={node.rgb} id={`${'' + i}`} />;

        if (row) {
          row.push(n);
        }
      }
      jsx.push(<Row key={`row-${height}`}>{row}</Row>);

      return (
        <Grid width={width * 36} height={height * 36}>
          <tbody>{jsx}</tbody>
        </Grid>
      );
    }

    return null;
  }

  render() {
    return (
      <Area>
        {this.renderGrid()}
        {this.renderGraph()}
      </Area>
    );
  }
}

export default GraphView;
