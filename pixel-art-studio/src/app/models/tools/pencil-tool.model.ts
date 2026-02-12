import { Tool, ToolContext } from '../../types/tool.interface';
import { getGridCoordinatesFromEvent } from '../../components/canvas/canvas.utils';
import { StrokeBatcher } from '../stroke-bactcher.model';
import { forEachBrushPixel } from './brush.utils';

export class PencilTool implements Tool {
  name: string = 'Pencil';
  icon: string = 'icons/pencil_black.svg';
  cursor: string = 'crosshair';
  isPointerDown: boolean = false;
  private strokeBatcher: StrokeBatcher = new StrokeBatcher();

  constructor() {}

  onPointerDown(event: PointerEvent, context: ToolContext): boolean {
    this.isPointerDown = true;
    this.strokeBatcher.start();
    return this.paintPixel(event, context);
  }

  onPointerUp(event: PointerEvent, context: ToolContext): boolean {
    this.isPointerDown = false;
    if (!context.historyManager) return false;
    const changed = this.strokeBatcher.commit(context.historyManager);
    this.strokeBatcher.clear();
    return changed;
  }

  onPointerMove(event: PointerEvent, context: ToolContext): boolean {
    if (!this.isPointerDown) return false;
    return this.paintPixel(event, context);
  }

  private paintPixel(event: PointerEvent, context: ToolContext): boolean {
    const { activeLayer, historyManager, fillColor, brushSize } = context;
    const { x: centerX, y: centerY } = getGridCoordinatesFromEvent(event, context);
    if (!activeLayer || !historyManager) return false;
    const layerGrid = activeLayer.getGrid();
    let changed = false;

    forEachBrushPixel(
      centerX,
      centerY,
      brushSize,
      layerGrid.getWidth(),
      layerGrid.getHeight(),
      (gridX, gridY) => {
        const oldColor = layerGrid.getPixelColor(gridX, gridY);
        if (oldColor === fillColor) return;

        const action = {
          type: 'PAINT',
          x: gridX,
          y: gridY,
          oldColor: oldColor,
          newColor: fillColor,
          layerId: activeLayer.getId().toString(),
          undo: () => layerGrid.setPixelColor(gridX, gridY, oldColor),
          redo: () => layerGrid.setPixelColor(gridX, gridY, fillColor),
        };

        layerGrid.setPixelColor(gridX, gridY, fillColor);
        this.strokeBatcher.add(action);
        changed = true;
      },
    );

    return changed;
  }
}
