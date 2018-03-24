//@flow

import React from 'react';
import styled from 'styled-components';
import logoDepixelIt from '../images/logo.png';

const HeaderRoot = styled.div`
  position: relative;
  width: calc(100% - 20px);
  height: 140px;
  line-height: 140px;
  font-size: 200%;
  background: #505050;
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
    <a href="https://github.com/TroX-oO/depixel-it">
      <img
        style={{ position: 'absolute', top: 0, right: 0, border: 0 }}
        src="https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png"
        alt="Fork me on GitHub"
      />
    </a>
  </HeaderRoot>
);

export default Header;
