//@flow

/*
 ** Imports
 */

import React from 'react';
import styled from 'styled-components';
import Graph from '../lib/Graph';
import { Voronoi } from 'react-vis';

import { scaleLinear } from 'd3-scale';

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

const Area = styled.svg`
  position: relative;
  display: block;
  text-align: center;
  margin: auto;
  width: 650px;
  height: 650px;
  overflow: scroll;
`;

/*
** Component
*/
const lines = [
  [{ x: 1, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 15 }, { x: 4, y: 12 }],
  [{ x: 1, y: 10 }, { x: 2, y: 4 }, { x: 3, y: 2 }, { x: 4, y: 15 }],
  [{ x: 1, y: 7 }, { x: 2, y: 11 }, { x: 3, y: 9 }, { x: 4, y: 2 }]
].map((p, i) => p.map(d => ({ ...d, line: i })));

const ContainerWidth = 400;
const ContainerHeight = 400;

class VoronoiView extends React.Component<PropTypes, null> {
  shouldComponentUpdate(nextProps: PropTypes) {
    return nextProps.graph && this.props.graph ? nextProps.graph.id !== this.props.graph.id : true;
  }

  renderVoronoi() {
    const { graph, width, height } = this.props;

    if (graph) {
      const x = scaleLinear()
        .domain([0, width])
        .range([0, ContainerWidth]);

      const y = scaleLinear()
        .domain([0, height])
        .range([ContainerHeight, 0]);

      return (
        <Voronoi
          extent={[[0, 0], [ContainerWidth, ContainerHeight]]}
          nodes={lines.reduce((acc, d) => [...acc, ...d], [])}
          polygonStyle={{ stroke: 'rgba(0, 0, 0, .7)' }}
          x={d => x(d.x)}
          y={d => y(d.y)}
        />
      );
    }
    return null;
  }

  render() {
    return <Area>{this.renderVoronoi()};</Area>;
  }
}

export default VoronoiView;
