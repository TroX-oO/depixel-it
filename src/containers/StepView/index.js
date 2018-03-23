//@flow

/*
** Imports
*/

import React from 'react';
import styled from 'styled-components';
import Graph from '../../lib/Graph';
import GraphView from '../../components/GraphView';
import Button from '../../components/Button';

/*
** Types
*/

type PropTypes = {
  className: string,
  children: any,
  width: number,
  height: number,
  steps: Array<{
    type: string,
    g?: {
      width: number,
      height: number,
      graph: Graph
    },
    image?: any
  }>
};

type StateTypes = {
  current: number
};

/*
** Styled
*/

const ControlsHeight = 50;

const Area = styled.div`
  display: block;
  text-align: center;
  ${props => `width: ${props.width}px;`};
  ${props => `height: ${props.height}px;`};
  margin: auto;
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  margin: auto;
  background-color: #f0f0f0;
  ${props => `width: ${props.width}px;`};
  ${props => `height: ${props.height}px;`};
`;

const Controls = styled.div`
  display: block;
  text-align: center;
  white-space: nowrap;
  margin-top: 10px;
  height: ${ControlsHeight - 10};
`;

const FinalImage = styled.div`
  ${props => `width: ${props.width}px;`};
  ${props => `height: ${props.height}px;`};

  ${props => `background-image: url(${props.src});`};
  background-size: auto;
  background-repeat: no-repeat;
  background-position: center;
`;

const StepIndex = styled.div`
  display: inline-block;
  width: 20px;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  background-color: #e8e8e8;
  border: 1px solid transparent;
  vertical-align: middle;
  margin: 0 -2px;
`;

/*
** Component
*/

class StepView extends React.Component<PropTypes, StateTypes> {
  state = {
    current: 0
  };

  componentWillReceiveProps(nextProps: PropTypes) {
    if (!nextProps.steps.length) {
      this.setState(prevState => ({
        ...prevState,
        current: 0
      }));
    } else {
      this.setState(prevState => ({
        ...prevState,
        current: nextProps.steps.length - 1
      }));
    }
  }

  stepDecrease = () => {
    this.setState(prevState => ({
      current: Math.max(prevState.current - 1, 0)
    }));
  };

  stepIncrease = () => {
    this.setState(prevState => ({
      current: Math.min(prevState.current + 1, this.props.steps.length - 1)
    }));
  };

  renderStep(step: any) {
    const { width, height } = this.props;

    if (step) {
      if (step.type === 'initial') {
        return <GraphView width={width} height={height - ControlsHeight} graph={step.g} />;
      } else if (step.type === 'reshaped') {
        return <GraphView width={width} height={height - ControlsHeight} graph={step.g} lattice />;
      } else if (step.type === 'final') {
        return <FinalImage width={width} height={height - ControlsHeight} src={step.image} />;
      }
    } else {
      return <div>Please load an image to see the result</div>;
    }
  }

  render() {
    const { className, steps, width, height, children } = this.props;
    const { current } = this.state;
    const s = steps[current];

    return (
      <Area className={className} width={width} height={height}>
        <Content width={width} height={height - ControlsHeight}>
          {this.renderStep(s)}
        </Content>
        {s ? (
          <Controls>
            <Button blue onClick={this.stepDecrease} disabled={!steps[current - 1]}>
              &lt;
            </Button>
            <StepIndex>{current + 1}</StepIndex>
            <Button blue onClick={this.stepIncrease} disabled={!steps[current + 1]}>
              &gt;
            </Button>
            {children}
          </Controls>
        ) : null}
      </Area>
    );
  }
}

export default StepView;
