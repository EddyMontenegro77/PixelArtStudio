export function getBrushBounds(
  centerX: number,
  centerY: number,
  size: number,
): { startX: number; startY: number; size: number; half: number } {
  const sizeRounded = Math.max(1, Math.floor(size));
  const half = Math.floor(sizeRounded / 2);
  return {
    startX: centerX - half,
    startY: centerY - half,
    size: sizeRounded,
    half,
  };
}

export function forEachBrushPixel(
  centerX: number,
  centerY: number,
  size: number,
  gridW: number,
  gridH: number,
  callback: (x: number, y: number) => void,
): void {
  const { startX, startY, size: s } = getBrushBounds(centerX, centerY, size);
  for (let y = startY; y < startY + s; y++) {
    if (y < 0 || y >= gridH) continue;
    for (let x = startX; x < startX + s; x++) {
      if (x < 0 || x >= gridW) continue;
      callback(x, y);
    }
  }
}
