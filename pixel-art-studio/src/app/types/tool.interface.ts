import { LayerModel } from '../models/layer.model';
import { HistoryManager } from '../models/history-manager.model';
import { FrameModel } from '../models/frame.model';

export enum ToolType {
  PENCIL = 'PENCIL',
  ERASER = 'ERASER',
  FILL = 'FILL',
  COLOR_PICKER = 'COLOR_PICKER',
}

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
}
