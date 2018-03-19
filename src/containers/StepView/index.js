//@flow

/*
** Imports
*/

import React from 'react';
import styled from 'styled-components';
import Graph from '../../lib/Graph';
import GraphView from '../../components/GraphView';
import VoronoiView from '../../components/VoronoiView';

/*
** Types
*/

type PropTypes = {
  className: string,
  steps: Array<{
    type: string,
    g: {
      width: number,
      height: number,
      graph: Graph
    }
  }>
};

type StateTypes = {
  current: number
};

/*
** Styled
*/

const Area = styled.div`
  display: block;
  text-align: center;
  margin: auto;
`;

const Content = styled.div`
  display: block;
  width: 650px;
  height: 650px;
  margin: auto;
`;

const Controls = styled.div`
  display: block;
  text-align: center;
`;

/*
** Component
*/

class StepView extends React.Component<PropTypes, StateTypes> {
  state = {
    current: 0
  };

  stepDecrease = () => {
    this.setState(prevState => ({
      current: prevState.current - 1
    }));
  };

  stepIncrease = () => {
    this.setState(prevState => ({
      current: prevState.current + 1
    }));
  };

  renderStep(step: any) {
    if (step) {
      if (step.type === 'initial') {
        return <GraphView {...step.g} />;
      } else if (step.type === 'reshaped') {
        return <VoronoiView {...step.g} />;
      }
    } else {
      <div>No step to display</div>;
    }
  }

  render() {
    const { className, steps } = this.props;
    const { current } = this.state;
    const s = steps[current];

    return (
      <Area className={className}>
        <Content>{this.renderStep(s)}</Content>
        <Controls>
          <button onClick={this.stepDecrease}>&lt;</button>
          <span>{current}</span>
          <button onClick={this.stepIncrease}>&gt;</button>
        </Controls>
      </Area>
    );
  }
}

export default StepView;
