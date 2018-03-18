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

function getPoints(graph, width, height) {
  const { nodes } = graph;
  const result = [];

  for (let i = 0; i < nodes.length; ++i) {
    const { edges, rgb } = nodes[i];
    let x = i % width + 0.5;
    let y = Math.floor(i / width) + 0.5;

    if (edges.length === 2) {
      for (let j = 0; j < edges.length; ++j) {}
    }

    result.push({
      x,
      y,
      style: rgb ? { fill: `rgba(${rgb.r},${rgb.g},${rgb.b},0.5)` } : null
    });
  }

  return result;
}

class VoronoiView extends React.Component<PropTypes, null> {
  shouldComponentUpdate(nextProps: PropTypes) {
    return nextProps.graph && this.props.graph ? nextProps.graph.id !== this.props.graph.id : true;
  }

  renderVoronoi() {
    const { graph, width, height } = this.props;
    const rw = Math.ceil(ContainerWidth / width);
    const rh = Math.ceil(ContainerHeight / height);
    const factor = Math.max(rw, rh);

    if (graph) {
      const x = scaleLinear()
        .domain([0, width])
        .range([0, width * factor]);

      const y = scaleLinear()
        .domain([0, height])
        .range([0, height * factor]);

      console.log(rw);
      console.log(rh);
      console.log('', width, height);
      return (
        <Voronoi
          extent={[[0, 0], [width * factor, height * factor]]}
          nodes={getPoints(graph, width, height)}
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
