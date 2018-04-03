// @flow

import React from 'react';
import Graph from '../lib/Graph';

function toPath(p: Path) {}

function toSvg(graph: Graph) {
  const paths = graph.paths();

  return <svg>{paths.map(p => toPath(p))}</svg>;
}

export default {
  toSvg
};
