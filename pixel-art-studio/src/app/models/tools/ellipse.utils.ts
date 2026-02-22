export type GridPoint = { x: number; y: number };

export function getEllipseOutlinePoints(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
): GridPoint[] {
  const rx = Math.max(0, Math.floor(radiusX));
  const ry = Math.max(0, Math.floor(radiusY));

  if (rx === 0 && ry === 0) {
    return [{ x: centerX, y: centerY }];
  }

  const points = new Set<string>();

  let x = 0;
  let y = ry;

  const rx2 = rx * rx;
  const ry2 = ry * ry;
  const twoRx2 = 2 * rx2;
  const twoRy2 = 2 * ry2;

  let px = 0;
  let py = twoRx2 * y;

  let decision1 = ry2 - rx2 * ry + 0.25 * rx2;
  while (px < py) {
    addSymmetric(points, centerX, centerY, x, y);
    x++;
    px += twoRy2;

    if (decision1 < 0) {
      decision1 += ry2 + px;
    } else {
      y--;
      py -= twoRx2;
      decision1 += ry2 + px - py;
    }
  }

  let decision2 =
    ry2 * (x + 0.5) * (x + 0.5) + rx2 * (y - 1) * (y - 1) - rx2 * ry2;
  while (y >= 0) {
    addSymmetric(points, centerX, centerY, x, y);
    y--;
    py -= twoRx2;

    if (decision2 > 0) {
      decision2 += rx2 - py;
    } else {
      x++;
      px += twoRy2;
      decision2 += rx2 - py + px;
    }
  }

  return Array.from(points).map((value) => {
    const [xCoord, yCoord] = value.split(',').map(Number);
    return { x: xCoord, y: yCoord };
  });
}

function addSymmetric(
  points: Set<string>,
  centerX: number,
  centerY: number,
  x: number,
  y: number,
): void {
  points.add(`${centerX + x},${centerY + y}`);
  points.add(`${centerX - x},${centerY + y}`);
  points.add(`${centerX - x},${centerY - y}`);
  points.add(`${centerX + x},${centerY - y}`);
}
