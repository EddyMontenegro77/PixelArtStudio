import { Tool, ToolContext } from './tool.interface';
import { getGridCoordinatesFromEvent } from '../../components/canvas/canvas.utils';
import { StrokeBatcher } from '../stroke-bactcher.model';

export class PencilTool implements Tool {
  name: string = 'Pencil';
  icon: string = 'assets/icons/pencil.svg';
  cursor: string = 'crosshair';
  brushSize: number = 1;
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
    const { activeLayer, historyManager, fillColor } = context;
    const { x, y } = getGridCoordinatesFromEvent(event, context);
    if (!activeLayer || !historyManager) return false;
    const layerGrid = activeLayer.getGrid();
    const oldColor = layerGrid.getPixelColor(x, y);

    if (oldColor === fillColor) return false;

    const action = {
      type: 'PAINT',
      x: x,
      y: y,
      oldColor: oldColor,
      newColor: fillColor,
      layerId: activeLayer.getId().toString(),
      undo: () => layerGrid.setPixelColor(x, y, oldColor),
      redo: () => layerGrid.setPixelColor(x, y, fillColor),
    };

    layerGrid.setPixelColor(x, y, fillColor);
    this.strokeBatcher.add(action);
    return true;
  }
}
