import { LayerModel } from '../models/layer.model';
import { HistoryManager } from '../models/history-manager.model';
import { FrameModel } from '../models/frame.model';

export enum ToolType {
  PENCIL = 'Pencil',
  LINE = 'Line',
  CIRCLE = 'Circle',
  ERASER = 'Eraser',
  FILL = 'Fill',
  EYEDROPPER = 'Eyedropper',
}

// Keybinds defined as a map to prevent duplicates
export const TOOL_KEYBINDS: Record<string, ToolType> = {
  P: ToolType.PENCIL,
  L: ToolType.LINE,
  C: ToolType.CIRCLE,
  E: ToolType.ERASER,
  F: ToolType.FILL,
  I: ToolType.EYEDROPPER,
};

export const TOOL_KEYBINDS_BY_TYPE: Record<ToolType, string> = Object.fromEntries(
  Object.entries(TOOL_KEYBINDS).map(([key, type]) => [type, key]),
) as Record<ToolType, string>;

export interface ToolContext {
  activeFrame: FrameModel | null;
  activeLayer: LayerModel | null;
  historyManager: HistoryManager | null;
  fillColor: string;
  pixelSize: number;
  brushSize: number;
}

export interface Tool {
  name: string;
  icon: string;
  cursor: string;
  onPointerDown: (event: PointerEvent, context: ToolContext) => boolean;
  onPointerMove: (event: PointerEvent, context: ToolContext) => boolean;
  onPointerUp: (event: PointerEvent, context: ToolContext) => boolean;
  renderOverlay?: (ctx: CanvasRenderingContext2D, context: ToolContext) => void;
}
