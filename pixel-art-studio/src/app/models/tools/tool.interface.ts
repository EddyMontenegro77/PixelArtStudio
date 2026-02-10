import { LayerModel } from '../layer.model';
import { HistoryManager } from '../history-manager.model';
import { FrameModel } from '../frame.model';

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
}

export interface Tool {
  name: string;
  icon: string;
  cursor: string;
  onPointerDown: (event: PointerEvent, context: ToolContext) => boolean;
  onPointerMove: (event: PointerEvent, context: ToolContext) => boolean;
  onPointerUp: (event: PointerEvent, context: ToolContext) => boolean;
}
