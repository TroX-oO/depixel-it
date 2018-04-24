//@flow

/*
 ** Imports
 */

import React from 'react';
import styled from 'styled-components';
import Path from '../lib/Path';
import { pathToSvg } from '../helpers/SvgWriter';

/*
 ** Types
 */

type PropTypes = {
  width: number,
  height: number,
  paths: Array<Path>
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
    const { paths, width, height } = this.props;
    let maxWidth = 1;
    let maxHeight = 1;

    for (let i = 0; i < paths.length; ++i) {
      const cp = paths[i];

      for (let j = 0; j < cp.length; ++j) {
        if (cp[j][0] > maxWidth) {
          maxWidth = cp[j][0];
        }
        if (cp[j][1] > maxHeight) {
          maxHeight = cp[j][1];
        }
      }
    }

    return Math.floor(Math.min(width / (maxWidth + 1), height / (maxHeight + 1)));
  }

  renderSvg() {
    const { paths, width, height } = this.props;
    const factor = this.factor();
    return pathToSvg(paths, width, height, factor);
  }

  render() {
    const { width, height } = this.props;

    return (
      <Container width={width} height={height}>
        {this.renderSvg()}
      </Container>
    );
  }
}

export default SvgView;
