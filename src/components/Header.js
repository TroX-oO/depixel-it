//@flow

import React from 'react';
import styled from 'styled-components';

const HeaderRoot = styled.div`
  width: 100%;
  height: 80px;
  line-height: 80px;
  font-size: 200%;
  background: black;
  color: white;
  text-align: left;
  padding-left: 20px;
`;

const Header = (props: any) => <HeaderRoot>Depixel-it</HeaderRoot>;

export default Header;
