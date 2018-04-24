// @flow

import React from 'react';
import Graph from '../lib/Graph';
import Path from '../lib/Path';

function toSvgPath(p: Path) {}

function toSvg(graph: Graph) {
  const paths = graph.paths();

  return <svg>{paths.map(p => toSvgPath(p))}</svg>;
}

export default {
  toSvg
};
