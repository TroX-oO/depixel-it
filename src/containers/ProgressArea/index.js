//@flow

/*
** Imports
*/

import React from 'react';
import styled from 'styled-components';
import { Line } from 'rc-progress';
import Graph from '../../lib/Graph';
import GraphView from '../../components/GraphView';

/*
** Types
*/

type PropTypes = {
  className: string,
  progress: ?number,
  initialGraph: ?{
    width: number,
    height: number,
    graph: Graph
  }
};

type StateTypes = {
  hover: boolean,
  loading: boolean,
  error: ?string,
  current: ?Object
};

/*
** Styled
*/

const Area = styled.div`
  display: block;
  text-align: center;
  margin: auto;
`;

/*
** Component
*/

class ProgressArea extends React.Component<PropTypes, StateTypes> {
  render() {
    const { className, progress, initialGraph } = this.props;

    return (
      <Area className={className}>
        <GraphView {...initialGraph} />
        <Line percent={progress} strokeWidth="2" />
      </Area>
    );
  }
}

export default ProgressArea;
