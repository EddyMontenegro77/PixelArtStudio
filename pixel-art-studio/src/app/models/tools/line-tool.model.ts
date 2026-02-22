import { getGridCoordinatesFromEvent } from '../../components/canvas/canvas.utils';
import { Tool, ToolContext } from '../../types/tool.interface';
import { StrokeBatcher } from '../stroke-bactcher.model';
import { forEachBrushPixel } from './brush.utils';
import { getLinePoints } from './line.utils';
import Action from '../../types/action';

export class LineTool implements Tool {
  name: string = 'Line';
  icon: string = '/icons/line_icon_black.svg';
  cursor: string = 'crosshair';
  private isPointerDown = false;
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private strokeBatcher: StrokeBatcher = new StrokeBatcher();

  onPointerDown(event: PointerEvent, context: ToolContext): boolean {
    const { x, y } = getGridCoordinatesFromEvent(event, context);
    this.startX = x;
    this.startY = y;
    this.currentX = x;
    this.currentY = y;
    this.isPointerDown = true;
    this.strokeBatcher.start();
    return false;
  }

  onPointerUp(event: PointerEvent, context: ToolContext): boolean {
    if (!this.isPointerDown) return false;
    this.isPointerDown = false;

    const { activeLayer, historyManager, fillColor, brushSize } = context;
    if (!activeLayer || !historyManager) {
      this.strokeBatcher.clear();
      return false;
    }

    const { x: endX, y: endY } = getGridCoordinatesFromEvent(event, context);
    this.currentX = endX;
    this.currentY = endY;
    const points = getLinePoints(this.startX, this.startY, endX, endY);
    const changed = this.paintLinePoints(points, context, brushSize, fillColor);

    const committed = this.strokeBatcher.commit(historyManager);
    this.strokeBatcher.clear();
    this.currentX = this.startX;
    this.currentY = this.startY;
    return changed && committed;
  }

  onPointerMove(event: PointerEvent, context: ToolContext): boolean {
    if (!this.isPointerDown) return false;
    const { x, y } = getGridCoordinatesFromEvent(event, context);
    this.currentX = x;
    this.currentY = y;
    return true;
  }

  renderOverlay(ctx: CanvasRenderingContext2D, context: ToolContext): void {
    if (!this.isPointerDown || !context.activeLayer) return;

    const grid = context.activeLayer.getGrid();
    const renderPixelSize = ctx.canvas.width / Math.max(1, grid.getWidth());
    const points = getLinePoints(this.startX, this.startY, this.currentX, this.currentY);

    ctx.save();
    ctx.fillStyle = context.fillColor;
    ctx.globalAlpha = 0.55;

    const previewPainted = new Set<string>();
    for (const point of points) {
      forEachBrushPixel(
        point.x,
        point.y,
        context.brushSize,
        grid.getWidth(),
        grid.getHeight(),
        (gridX, gridY) => {
          const key = `${gridX},${gridY}`;
          if (previewPainted.has(key)) return;
          previewPainted.add(key);
          ctx.fillRect(
            gridX * renderPixelSize,
            gridY * renderPixelSize,
            renderPixelSize,
            renderPixelSize,
          );
        },
      );
    }

    ctx.restore();
  }

  private paintLinePoints(
    points: Array<{ x: number; y: number }>,
    context: ToolContext,
    brushSize: number,
    fillColor: string,
  ): boolean {
    const { activeLayer } = context;
    if (!activeLayer) return false;

    const grid = activeLayer.getGrid();
    const painted = new Set<string>();
    let changed = false;

    for (const point of points) {
      forEachBrushPixel(
        point.x,
        point.y,
        brushSize,
        grid.getWidth(),
        grid.getHeight(),
        (gridX, gridY) => {
          const key = `${gridX},${gridY}`;
          if (painted.has(key)) return;
          painted.add(key);

          const oldColor = grid.getPixelColor(gridX, gridY);
          if (oldColor === fillColor) return;

          const action: Action = {
            type: 'PAINT',
            x: gridX,
            y: gridY,
            oldColor,
            newColor: fillColor,
            layerId: activeLayer.getId().toString(),
            undo: () => grid.setPixelColor(gridX, gridY, oldColor),
            redo: () => grid.setPixelColor(gridX, gridY, fillColor),
          };

          grid.setPixelColor(gridX, gridY, fillColor);
          this.strokeBatcher.add(action);
          changed = true;
        },
      );
    }

    return changed;
  }
}
