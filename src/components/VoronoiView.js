//@flow

/*
 ** Imports
 */

import React from 'react';
import styled from 'styled-components';
import Graph from '../lib/Graph';
import { Voronoi } from 'react-vis';

import { scaleQuantize } from 'd3-scale';
import { circumcenter } from '../lib/Triangle';

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

const SVG = styled.svg`
  position: relative;
  display: block;
  text-align: center;
  margin: auto;
  width: 650px;
  height: 650px;
  overflow: scroll;
`;

const DotPlan = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  ${props => `width: ${props.width}px`};
  ${props => `height: ${props.height}px`};
`;

const Dot = styled.div`
  position: absolute;
  ${props => `top: ${props.top}px`};
  ${props => `left: ${props.left}px`};

  width: 6px;
  height: 6px;
  margin-top: -3px;
  margin-left: -3px;
  background-color: black;
  border-radius: 3px;
`;

/*
** Component
*/

function getPoints(graph, width, height) {
  const { nodes } = graph;
  const result = [];

  for (let i = 0; i < nodes.length; ++i) {
    const { edges, rgb } = nodes[i];
    let { x, y } = nodes[i];

    if (edges.length === 2) {
      console.log(`2 egeds: ${x} ${y}`);
      const e1 = edges[0].nodeId;
      const e2 = edges[1].nodeId;
      const cc = circumcenter(nodes[i], nodes[e1], nodes[e2]);

      if (cc) {
        x = cc.x;
        y = cc.y;
      }
      console.log(`circum between edges: ${nodes[e1].x},${nodes[e1].y} ${nodes[e2].x},${nodes[e2].y}`);
      console.log(`result: ${x} ${y}`);
    }

    if (isNaN(x) || isNaN(y)) {
      x = nodes[i].x;
      y = nodes[i].y;
    }

    result.push({
      x: Math.max(Math.min(x, width), 0),
      y: Math.max(Math.min(y, height), 0),
      style: rgb ? { fill: `rgba(${rgb.r},${rgb.g},${rgb.b},0.5)` } : null
    });
  }
  console.log(result);
  console.log(
    result
      .map(p => {
        return `${p.x},${p.y} `;
      })
      .join()
  );
  return result;
}

function roundToQuarter(value) {
  return (
    Math.floor(value) +
    scaleQuantize()
      .domain([0, 1])
      .range([0, 0.25, 0.5, 0.75])(value % 1)
  );
}

class VoronoiView extends React.Component<PropTypes, null> {
  shouldComponentUpdate(nextProps: PropTypes) {
    return nextProps.graph && this.props.graph ? nextProps.graph.id !== this.props.graph.id : true;
  }

  renderDebug() {
    const { graph, width, height } = this.props;
    const rw = Math.ceil(ContainerWidth / width);
    const rh = Math.ceil(ContainerHeight / height);
    const factor = Math.max(rw, rh);

    if (graph) {
      const points = getPoints(graph, width, height);
      return (
        <DotPlan width={width * factor} height={height * factor}>
          {points.map((p, idx) => {
            return <Dot key={idx} top={roundToQuarter(p.y) * factor} left={roundToQuarter(p.x) * factor} />;
          })}
        </DotPlan>
      );
    }
    return null;
  }

  renderVoronoi() {
    const { graph, width, height } = this.props;
    const rw = Math.ceil(ContainerWidth / width);
    const rh = Math.ceil(ContainerHeight / height);
    const factor = Math.max(rw, rh);

    if (graph) {
      return (
        <Voronoi
          extent={[[0, 0], [width * factor, height * factor]]}
          nodes={getPoints(graph, width, height)}
          polygonStyle={{ stroke: 'rgba(0, 0, 0, .7)' }}
          x={d => {
            console.log(`in ${d.x} -> out ${roundToQuarter(d.x)}`);
            return roundToQuarter(d.x) * factor;
          }}
          y={d => {
            console.log(`in ${d.y} -> out ${roundToQuarter(d.y)}`);
            return roundToQuarter(d.y) * factor;
          }}
        />
      );
    }
    return null;
  }

  render() {
    return (
      <Area>
        <SVG>{this.renderVoronoi()}</SVG>
        {this.renderDebug()}
      </Area>
    );
  }
}

export default VoronoiView;
