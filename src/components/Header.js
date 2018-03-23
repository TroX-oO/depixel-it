//@flow

import React from 'react';
import styled from 'styled-components';
import logoDepixelIt from '../images/logo.png';

const HeaderRoot = styled.div`
  width: calc(100% - 20px);
  height: 80px;
  line-height: 80px;
  font-size: 200%;
  background: black;
  color: white;
  text-align: left;
  padding-left: 20px;
`;

const Logo = styled.img`
  vertical-align: middle;
  margin-right: 15px;
`;

const Header = (props: any) => (
  <HeaderRoot>
    <Logo src={logoDepixelIt} height={50} />Depixel-it
  </HeaderRoot>
);

export default Header;
