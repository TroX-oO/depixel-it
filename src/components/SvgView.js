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

const Margin = 10;

/*
 ** Styled
 */

const Container = styled.div`
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

class SvgView extends React.Component<PropTypes, null> {
  constructor() {
    super();
  }

  factor() {
    const { graph, width, height } = this.props;

    if (graph) {
      return Math.floor(Math.min(width / (graph.width + 1), height / (graph.height + 1)));
    } else {
      return 1;
    }
  }

  renderSvg() {
    const { graph, width, height } = this.props;
    const factor = this.factor();
  }

  render() {
    const { graph, width, height } = this.props;
    const factor = this.factor();
    const cwidth = (graph ? graph.width * factor : width) + 2 * Margin;
    const cheight = (graph ? graph.height * factor : height) + 2 * Margin;

    return (
      <Container width={width} height={height}>
        {this.renderSvg()};
      </Container>
    );
  }
}

export default SvgView;
