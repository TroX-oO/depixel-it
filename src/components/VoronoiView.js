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

const ContainerWidth = 400;
const ContainerHeight = 400;

function getPoints(graph) {
  const { nodes } = graph;
  const result = [];

  for (let i = 0; i < nodes.length; ++i) {}

  return result;
}

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
        .range([0, ContainerHeight]);

      return (
        <Voronoi
          extent={[[0, 0], [ContainerWidth, ContainerHeight]]}
          nodes={getPoints(graph)}
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
