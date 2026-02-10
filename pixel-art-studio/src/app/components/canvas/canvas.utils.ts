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
  const target = event.target as HTMLElement;
  const rect = target.getBoundingClientRect();
  const xOffset: number = event.clientX - rect.left;
  const yOffset: number = event.clientY - rect.top;
  const { x, y } = getGridCoordinates(xOffset, yOffset, context.pixelSize);
  return { x, y };
}

// cursorPosition according the container
export function getCursorContainerPosition(
  event: WheelEvent | PointerEvent,
  containerBounds: DOMRect,
): { cursorX: number; cursorY: number } {
  const cursorX = event.clientX - containerBounds.left;
  const cursorY = event.clientY - containerBounds.top;
  return { cursorX, cursorY };
}

// Real canvas position
export function getCursorCanvasPosition(
  cursorX: number,
  cursorY: number,
  panX: number,
  panY: number,
  oldScale: number,
): { canvasX: number; canvasY: number } {
  const canvasX = (cursorX - panX) / oldScale;
  const canvasY = (cursorY - panY) / oldScale;
  return { canvasX, canvasY };
}

// Keep same pixel of canvas under pointer after zoom
export function updatePanToKeepPointUnderCursor(
  cursorX: number,
  cursorY: number,
  canvasX: number,
  canvasY: number,
  newScale: number,
): { panX: number; panY: number } {
  const panX = cursorX - canvasX * newScale;
  const panY = cursorY - canvasY * newScale;
  return { panX, panY };
}
