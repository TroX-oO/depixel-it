//@flow

/*
** Imports
*/

import React from 'react';
import Dropzone from 'react-dropzone';
import styled from 'styled-components';

/*
** Types
*/

type PropTypes = {
  onImageLoaded: ?(Object) => void
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
  width: 300px;
  height: 300px;
  text-align: center;
  margin: auto;
`;

const Zone = styled(Dropzone)`
  width: 200px;
  height: 200px;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 150%;
  text-align: center;
  display: table-cell;
  vertical-align: middle;
  transition: background-color 250ms ease-in-out;
  border-radius: 5px;
  border: 3px dashed #999;
  background-color: #f0f0f0;
  color: #999;
  padding: 20px;
  margin: 10px auto;
  display: block;

  ${props => (props.current ? `background-color: transparent;` : '')};

  &.active {
    background-color: #c9e1ff;
  }

  &.reject {
    background-color: #ff7979;
    color: black;
  }
`;

const SpriteImage = styled.div`
  width: 200px;
  height: 200px;

  ${props => `background-image: url(${props.src});`};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const ErrorMsg = styled.div`
  color: red;
`;

/*
** Component
*/

class DropArea extends React.Component<PropTypes, StateTypes> {
  state = {
    hover: false,
    loading: false,
    error: null,
    current: null
  };

  onDragEnter = () => {
    this.setState(prevState => ({
      ...prevState,
      hover: true
    }));
  };

  onDragLeave = () => {
    this.setState(prevState => ({
      ...prevState,
      hover: false
    }));
  };

  onDropAccepted = (e: any) => {
    const file = e[0];

    this.setState(prevState => ({
      ...prevState,
      hover: false,
      loading: !!file,
      error: null
    }));

    if (file) {
      this.loadImage(file);
    }
  };

  loadImage = (file: Object) => {
    const reader = new FileReader();

    console.log(file);
    reader.onload = (event: any) => {
      var img = new Image();

      img.onload = () => {
        if (img.width > 50 || img.height > 50) {
          this.setState(prevState => ({
            ...prevState,
            loading: false,
            error: 'Max image size is 50x50px'
          }));
        } else {
          this.setState(prevState => ({
            ...prevState,
            loading: false,
            current: event.target.result
          }));
          if (this.props.onImageLoaded) {
            this.props.onImageLoaded(img);
          }
        }
      };

      img.src = event.target.result;
    };
    reader.onerror = (event: any) => {
      console.error('error loading file ' + file.name);
      console.log(event);
    };
    reader.readAsDataURL(file);
  };

  render() {
    const { hover, current, error } = this.state;

    return (
      <Area>
        <Zone
          current={current}
          accept="image/*"
          activeClassName="active"
          rejectClassName="reject"
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
          onDropAccepted={this.onDropAccepted}>
          {!hover ? !current ? 'Drop your sprite here' : <SpriteImage src={current} /> : 'Release!'}
        </Zone>
        {error ? <ErrorMsg>{error}</ErrorMsg> : null}
      </Area>
    );
  }
}

export default DropArea;
