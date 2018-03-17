//@flow

/*
 ** Imports
 */

import React from 'react';
import styled from 'styled-components';
import { Voronoi } from 'react-vis';

import { scaleLinear } from 'd3-scale';

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
const point = (x, y) => ({ x, y });

const lines = [point(1, 1), point(2, 5), point(4, 2), point(4, 4), point(2, 7), point(4, 7)];

console.log(lines);
const ContainerWidth = 200;
const ContainerHeight = 200;
const x = scaleLinear()
  .domain([0, 8])
  .range([0, ContainerWidth]);

const y = scaleLinear()
  .domain([0, 8])
  .range([0, ContainerHeight]);

class TestView extends React.Component<{}, null> {
  renderVoronoi() {
    return (
      <Voronoi
        extent={[[0, 0], [ContainerWidth, ContainerHeight]]}
        nodes={lines}
        polygonStyle={{ stroke: 'rgba(0, 0, 0, .7)' }}
        x={d => x(d.x)}
        y={d => y(d.y)}
      />
    );
  }

  render() {
    return <Area>{this.renderVoronoi()};</Area>;
  }
}

export default TestView;
