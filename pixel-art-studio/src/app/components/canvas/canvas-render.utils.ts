import { FrameModel } from '../../models/frame.model';
import { GridModel } from '../../models/Grid.model';

export function renderCheckerboard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pixelSize: number,
  dark: string = '#e0e0e0',
  light: string = '#ffffff',
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isDark = (x + y) % 2 === 0;
      ctx.fillStyle = isDark ? dark : light;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
}

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  grid: GridModel,
  pixelSize: number,
): void {
  const pixels = grid.getPixels();
  for (let y = 0; y < grid.getHeight(); y++) {
    for (let x = 0; x < grid.getWidth(); x++) {
      const color = pixels[x][y];
      if (color === 'transparent') continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
}

export function renderVisibleLayers(
  ctx: CanvasRenderingContext2D,
  frame: FrameModel,
  pixelSize: number,
): void {
  // UI order is top -> bottom, but canvas must be drawn bottom -> top.
  const layers = frame.getLayers().slice().reverse();
  layers.forEach((layer) => {
    if (layer.isVisible()) {
      renderGrid(ctx, layer.getGrid(), pixelSize);
    }
  });
}
