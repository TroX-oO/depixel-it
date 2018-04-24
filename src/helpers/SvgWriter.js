//@flow
import React from 'react';
import Path from '../lib/Path';

import { saveSvgAsPng } from '../../node_modules/save-svg-as-png/saveSvgAsPng.js';

export function pathToSvg(paths: Array<any>, width: number, height: number, f?: number) {
  const factor = f || 1;
  const svgPaths = [];

  for (let i = 0; i < paths.length; ++i) {
    const p = paths[i];

    console.log(`rendering path ${JSON.stringify(p)}`);
    // svgPaths.push(<path d={Path.toSvgPathLine(p, factor)} key={'pathline' + i} fill="transparent" stroke="grey" />);
    svgPaths.push(<path d={Path.toSvgPath(p, factor)} key={'path-' + i} fill="transparent" stroke="black" />);
  }
  for (let i = 0; i < paths.length; ++i) {
    const p = paths[i];

    for (let j = 0; j < p.length; ++j) {
      const c = p[j];

      // svgPaths.push(<circle cx={c[0] * factor} cy={c[1] * factor} r={2} key={'circ-' + i + '-' + j} fill="red" />);
    }
  }

  return <svg viewBox={`0 0 ${width} ${height}`}>{svgPaths}</svg>;
}

export function saveToSvg(svgEl: any, name: string) {
  svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  var svgData = svgEl.outerHTML;
  var preface = '<?xml version="1.0" standalone="no"?>\r\n';
  var svgBlob = new Blob([preface, svgData], { type: 'image/svg+xml;charset=utf-8' });
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement('a');
  downloadLink.href = svgUrl;
  downloadLink.download = name;

  if (document.body) {
    document.body.appendChild(downloadLink);
  }
  downloadLink.click();

  if (document.body) {
    document.body.removeChild(downloadLink);
  }
}

export function saveToPng(svgEl: any, name: string, factor: number) {
  saveSvgAsPng(svgEl, name, { scale: factor });
}
