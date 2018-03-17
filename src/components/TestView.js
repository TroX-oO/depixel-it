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
const lines2 = [
  [{ x: 1, y: 0 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }],
  [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }],
  [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }]
];
const lines = [point(1, 1), point(1, 0), point(1, 2)] || lines2;
console.log(lines);
const ContainerWidth = 650;
const ContainerHeight = 650;
const x = scaleLinear()
  .domain([0, 4])
  .range([0, ContainerWidth]);

const y = scaleLinear()
  .domain([0, 4])
  .range([ContainerHeight, 0]);

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
