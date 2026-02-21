import { getGridCoordinatesFromEvent } from '../../components/canvas/canvas.utils';
import { Tool, ToolContext } from '../../types/tool.interface';

export class EyedropperTool implements Tool {
  name: string = 'Eyedropper';
  icon: string = '/icons/eyedropper_icon_black.svg';
  cursor: string = 'crosshair';

  onPointerDown(_event: PointerEvent, _context: ToolContext): boolean {
    return false;
  }

  onPointerUp(event: PointerEvent, context: ToolContext): boolean {
    if (!context.activeLayer) return false;
    const { x: gridX, y: gridY } = getGridCoordinatesFromEvent(event, context);
    const colorPicked = this.pickColorFromAllLayers(context, gridX, gridY);
    context.fillColor = colorPicked;
    return true;
  }

  onPointerMove(): boolean {
    return false;
  }

  private pickColorFromAllLayers(context: ToolContext, gridX: number, gridY: number): string {
    if (!context.activeFrame) return 'transparent';
    const layers = context.activeFrame.getLayers();
    for (const layer of layers.slice().reverse()) {
      if (!layer.isVisible()) continue;

      const layerGrid = layer.getGrid();
      const gridPixels = layerGrid.getPixels();

      if (layerGrid.getHeight() <= gridY || layerGrid.getWidth() <= gridX || gridX < 0 || gridY < 0)
        return 'transparent';

      const colorPicked = gridPixels[gridX][gridY];

      if (colorPicked !== 'transparent') {
        return colorPicked;
      }
    }
    return 'transparent';
  }
}
