export type GridPoint = { x: number; y: number };

export function getCircleOutlinePoints(
  centerX: number,
  centerY: number,
  radius: number,
): GridPoint[] {
  const safeRadius = Math.max(0, Math.floor(radius));
  if (safeRadius === 0) {
    return [{ x: centerX, y: centerY }];
  }

  /*Midpoint Circle Algorithm
  Decision: choose between side or diagonal pixel.
  Just 1/8 of circle is looped, the rest are added by symetry.
  */
  const points = new Set<string>();
  let x = safeRadius;
  let y = 0;
  let decision = 1 - safeRadius;

  while (x >= y) {
    addSymmetric(points, centerX, centerY, x, y);
    y++;

    if (decision <= 0) {
      decision += 2 * y + 1;
    } else {
      x--;
      decision += 2 * (y - x) + 1;
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
  points.add(`${centerX + y},${centerY + x}`);
  points.add(`${centerX - y},${centerY + x}`);
  points.add(`${centerX - x},${centerY + y}`);
  points.add(`${centerX - x},${centerY - y}`);
  points.add(`${centerX - y},${centerY - x}`);
  points.add(`${centerX + y},${centerY - x}`);
  points.add(`${centerX + x},${centerY - y}`);
}
