//@flow

import styled, { css } from 'styled-components';

const Button = styled.div`
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  color: #222;
  background-color: #eee;
  border-color: #aaa;

  ${props => {
    if (props.disabled) {
      return css`
        opacity: 0.5;
      `;
    } else {
      return css`
        &:hover {
          background-color: #c2c2c2;
        }
        &:active {
          background-color: #d3d3d3;
        }
      `;
    }
  }};

  ${props =>
    props.blue &&
    css`
      color: #fff;
      background-color: #007bff;
      border-color: #007bff;

      ${!props.disabled
        ? `&:hover {
        background-color: #49a1ff;
        border-color: #49a1ff;
      }
      &:active {
        background-color: #218cff;
        border-color: #218cff;
      }`
        : ''};
    `};
`;

export default Button;
