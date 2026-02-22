export type GridPoint = { x: number; y: number };

export function getLinePoints(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): GridPoint[] {
  const points: GridPoint[] = [];
  let x = startX;
  let y = startY;

  const deltaX = Math.abs(endX - startX);
  const deltaY = Math.abs(endY - startY);
  const stepX = startX < endX ? 1 : -1;
  const stepY = startY < endY ? 1 : -1;
  let error = deltaX - deltaY;

  while (true) {
    points.push({ x, y });
    if (x === endX && y === endY) break;

    /* Error balances horizontal or vertical movement
       to keep drawing a good aproach of the slope
       Bresenham line algorithm
    */
    const error2 = error * 2;
    if (error2 > -deltaY) {
      error -= deltaY;
      x += stepX;
    }
    if (error2 < deltaX) {
      error += deltaX;
      y += stepY;
    }
  }

  return points;
}
