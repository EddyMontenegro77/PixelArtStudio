import { ToolContext } from '../../models/tools/tool.interface';

export function getGridCoordinates(
  xOffset: number,
  yOffset: number,
  pixelSize: number,
): { x: number; y: number } {
  const x = Math.floor(xOffset / pixelSize);
  const y = Math.floor(yOffset / pixelSize);
  return { x, y };
}

export function getGridCoordinatesFromEvent(
  event: PointerEvent,
  context: ToolContext,
): { x: number; y: number } {
  const xOffset: number = event.offsetX;
  const yOffset: number = event.offsetY;
  const { x, y } = getGridCoordinates(xOffset, yOffset, context.pixelSize);
  return { x, y };
}
