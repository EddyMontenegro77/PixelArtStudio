import { getGridCoordinatesFromEvent } from '../../components/canvas/canvas.utils';
import Action from '../../types/Action';
import { Tool, ToolContext } from '../../types/tool.interface';
import { StrokeBatcher } from '../stroke-bactcher.model';
import { forEachBrushPixel } from './brush.utils';
import { getEllipseOutlinePoints } from './ellipse.utils';

export class EllipseTool implements Tool {
  name: string = 'Ellipse';
  icon: string = '/icons/ellipse_icon_black.svg';
  cursor: string = 'crosshair';
  private isPointerDown = false;
  private centerX = 0;
  private centerY = 0;
  private currentX = 0;
  private currentY = 0;
  private strokeBatcher: StrokeBatcher = new StrokeBatcher();

  onPointerDown(event: PointerEvent, context: ToolContext): boolean {
    const { x, y } = getGridCoordinatesFromEvent(event, context);
    this.centerX = x;
    this.centerY = y;
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

    const radiusX = Math.abs(endX - this.centerX);
    const radiusY = Math.abs(endY - this.centerY);
    const points = getEllipseOutlinePoints(this.centerX, this.centerY, radiusX, radiusY);
    const changed = this.paintEllipsePoints(points, context, brushSize, fillColor);

    const committed = this.strokeBatcher.commit(historyManager);
    this.strokeBatcher.clear();
    this.currentX = this.centerX;
    this.currentY = this.centerY;
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
    const radiusX = Math.abs(this.currentX - this.centerX);
    const radiusY = Math.abs(this.currentY - this.centerY);
    const points = getEllipseOutlinePoints(this.centerX, this.centerY, radiusX, radiusY);

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

  private paintEllipsePoints(
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
