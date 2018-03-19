function det(m00, m01, m10, m11) {
  return m00 * m11 - m01 * m10;
}

export function circumcenter(a, b, c) {
  let cx, cy, ax, ay, bx, by, denom, numx, numy, ccx, ccy;

  cx = c.x;
  cy = c.y;
  ax = a.x - cx;
  ay = a.y - cy;
  bx = b.x - cx;
  by = b.y - cy;
  denom = 2 * det(ax, ay, bx, by);
  numx = det(ay, ax * ax + ay * ay, by, bx * bx + by * by);
  numy = det(ax, ax * ax + ay * ay, bx, bx * bx + by * by);
  ccx = cx - numx / denom;
  ccy = cy + numy / denom;

  if (!isNaN(ccx) && !isNaN(ccy)) {
    return {
      x: ccx,
      y: ccy
    };
  }
  return null;
}
