//@flow

/*
 ** Imports
 */

import React from 'react';
import styled from 'styled-components';
import Button from './Button';

/*
 ** Types
 */

type PropTypes = {
  className: ?string,
  items: Array<{
    title: string,
    handler: () => void
  }>,
  children: any
};

type StateTypes = {
  visible: boolean
};

/*
 ** Styled
 */

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
  text-align: left;
  margin: auto;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1;
`;

const MenuItem = Button.extend`
  background-color: #fefefe;
  color: #222;
  display: block;
  border-radius: 4px;
  text-align: right;
  font-size: 80%;
  padding: 8px 10px 8px 20px;
  border-color: #cecece;

  &:not(:last-child) {
    border-radius: 0;
    border-bottom: none;
  }

  &:last-child {
    border-radius: 0 0 4px 4px;
  }
  &:first-child {
    border-radius: 4px 4px 0 0;
  }
`;

/*
** Component
*/

class Dropdown extends React.Component<PropTypes, StateTypes> {
  state = {
    visible: false
  };

  handleClick = () => {
    this.setState(prevState => ({
      visible: !prevState.visible
    }));
  };

  handleItemClick = (item: Object) => () => {
    this.setState(prevState => ({
      visible: false
    }));
    item.handler();
  };

  renderMenu() {
    const { items } = this.props;
    const jsx = items.map((item, idx) => (
      <MenuItem key={idx} onClick={this.handleItemClick(item)}>
        {item.title}
      </MenuItem>
    ));

    return <DropdownMenu>{jsx}</DropdownMenu>;
  }

  render() {
    const { children, className } = this.props;
    const { visible } = this.state;

    return (
      <DropdownWrapper className={className}>
        <Button onClick={this.handleClick}>{children} &#x25BC;</Button>
        {visible ? this.renderMenu() : null}
      </DropdownWrapper>
    );
  }
}

export default Dropdown;
