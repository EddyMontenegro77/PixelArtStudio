import { getGridCoordinatesFromEvent } from '../../components/canvas/canvas.utils';
import Action from '../../types/Action';
import { Tool, ToolContext } from '../../types/tool.interface';
import { StrokeBatcher } from '../stroke-bactcher.model';

type GridPoint = { x: number; y: number };

export class FillTool implements Tool {
  name: string = 'Fill';
  icon: string = '/icons/bucket_icon_black.svg';
  cursor: string = 'crosshair';
  private strokeBatcher: StrokeBatcher = new StrokeBatcher();

  onPointerDown(event: PointerEvent, context: ToolContext): boolean {
    const { activeLayer, historyManager, fillColor } = context;
    if (!activeLayer || !historyManager) return false;

    const { x: startX, y: startY } = getGridCoordinatesFromEvent(event, context);
    const grid = activeLayer.getGrid();
    const width = grid.getWidth();
    const height = grid.getHeight();

    if (startX < 0 || startY < 0 || startX >= width || startY >= height) return false;

    const targetColor = grid.getPixelColor(startX, startY);
    if (targetColor === fillColor) return false;

    this.strokeBatcher.start();
    const changed = this.floodFill(
      { x: startX, y: startY },
      targetColor,
      fillColor,
      width,
      height,
      (x, y) => {
        const oldColor = grid.getPixelColor(x, y);
        if (oldColor !== targetColor) return;

        const action: Action = {
          type: 'PAINT',
          x,
          y,
          oldColor,
          newColor: fillColor,
          layerId: activeLayer.getId().toString(),
          undo: () => grid.setPixelColor(x, y, oldColor),
          redo: () => grid.setPixelColor(x, y, fillColor),
        };

        grid.setPixelColor(x, y, fillColor);
        this.strokeBatcher.add(action);
      },
      (x, y) => grid.getPixelColor(x, y),
    );

    const committed = this.strokeBatcher.commit(historyManager);
    this.strokeBatcher.clear();
    return changed && committed;
  }

  onPointerMove(_event: PointerEvent, _context: ToolContext): boolean {
    return false;
  }

  onPointerUp(_event: PointerEvent, _context: ToolContext): boolean {
    return false;
  }

  /*
   * Iterative DFS flood fill.
   * Starting from a pixel, it replaces all 4-directionally connected
   * pixels that match targetColor by replacing them with replacementColor.
   * Uses a stack and skips out-of-bounds, visited,
   * or non-matching pixels.
   * (targetColor) is the color of the pixel where we clicked.
   */

  private floodFill(
    start: GridPoint,
    targetColor: string,
    replacementColor: string,
    width: number,
    height: number,
    paintAt: (x: number, y: number) => void,
    getColorAt: (x: number, y: number) => string,
  ): boolean {
    if (targetColor === replacementColor) return false;

    const stack: GridPoint[] = [start];
    const visited = new Set<string>();
    let changed = false;

    while (stack.length > 0) {
      const point = stack.pop()!;
      const key = `${point.x},${point.y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (point.x < 0 || point.y < 0 || point.x >= width || point.y >= height) continue;
      if (getColorAt(point.x, point.y) !== targetColor) continue;

      paintAt(point.x, point.y);
      changed = true;

      stack.push({ x: point.x + 1, y: point.y });
      stack.push({ x: point.x - 1, y: point.y });
      stack.push({ x: point.x, y: point.y + 1 });
      stack.push({ x: point.x, y: point.y - 1 });
    }

    return changed;
  }
}
