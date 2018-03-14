//@flow

/*
** Imports
*/

import React from 'react';
import styled from 'styled-components';
import DropArea from '../DropArea';

/*
** Types
*/

export type StateTypes = {
  imageData: any
};

/*
** Styled
*/

const Page = styled.div`
  display: block;
  width: 900px;
  text-align: center;
  margin: auto;
`;

const PreviewDrop = styled.div`
  display: inline-block;
  width: 400px;
  height: 400px;
  text-align: center;
  border: 1px solid gray;
  margin: 10px;
`;

const ProcessedArea = styled.div`
  display: inline-block;
  width: 400px;
  height: 400px;
  text-align: center;
  border: 1px solid gray;
  margin: 10px;
  vertical-align: top;
`;

/*
** Component
*/

class MainPage extends React.Component<{}, StateTypes> {
  state = {
    imageData: null
  };

  onImageLoaded = (image: Object) => {
    this.setState(prevState => ({
      imageData: image
    }));
  };

  render() {
    const { imageData } = this.state;

    return (
      <Page>
        <PreviewDrop>
          <DropArea onImageLoaded={this.onImageLoaded} />
          <button disabled={!imageData}>Process</button>
        </PreviewDrop>
        <ProcessedArea>
          <div>Result !</div>
        </ProcessedArea>
      </Page>
    );
  }
}

export default MainPage;
