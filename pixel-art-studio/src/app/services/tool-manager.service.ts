import { Injectable } from '@angular/core';
import { Tool, ToolContext, ToolType } from '../types/tool.interface';
import { PencilTool } from '../models/tools/pencil-tool.model';
import { EraserTool } from '../models/tools/eraser-tool.model';
import { ProjectService } from './project.service';
import { Subject } from 'rxjs';
import { EyedropperTool } from '../models/tools/eyedropper-tool.model';
import { LineTool } from '../models/tools/line-tool.model';
import { CircleTool } from '../models/tools/circle-tool.model';

@Injectable({
  providedIn: 'root',
})
export class ToolManagerService {
  historyChanged$ = new Subject<void>();
  private tools: Map<ToolType, Tool> = new Map<ToolType, Tool>([
    [ToolType.PENCIL, new PencilTool()],
    [ToolType.LINE, new LineTool()],
    [ToolType.CIRCLE, new CircleTool()],
    [ToolType.ERASER, new EraserTool()],
    [ToolType.EYEDROPPER, new EyedropperTool()],
  ]);
  private activeTool: Tool = this.tools.get(ToolType.PENCIL)!;

  private toolContext: ToolContext = {
    activeFrame: null,
    activeLayer: null,
    historyManager: null,
    fillColor: '#000000FF',
    pixelSize: 8,
    brushSize: 1,
  };

  constructor(private projectService: ProjectService) {
    this.projectService.project$.subscribe((project) => {
      if (!project) return;
      this.toolContext.historyManager = this.projectService.getHistoryManager();
      const activeFrame = project.getActiveFrame();
      this.toolContext.activeFrame = activeFrame;
      this.toolContext.activeLayer = activeFrame.getActiveLayer();
    });
  }

  getActiveTool(): Tool {
    return this.activeTool;
  }

  setActiveTool(toolType: ToolType) {
    this.activeTool = this.tools.get(toolType)!;
  }

  getTools(): { type: ToolType; tool: Tool }[] {
    return Array.from(this.tools.entries()).map(([type, tool]) => ({ type, tool }));
  }

  setPixelSize(size: number): void {
    this.toolContext.pixelSize = size;
  }

  setBrushSize(size: number): void {
    this.toolContext.brushSize = size;
  }

  getBrushSize(): number {
    return this.toolContext.brushSize;
  }

  setFillColor(color: string): void {
    this.toolContext.fillColor = color;
  }

  getFillColor(): string {
    return this.toolContext.fillColor;
  }

  private isContextReady(): boolean {
    return !!this.toolContext.activeLayer && !!this.toolContext.historyManager;
  }

  handleUndo() {
    if (!this.toolContext.historyManager) return;
    this.toolContext.historyManager.undo();
    this.historyChanged$.next();
  }

  handleRedo() {
    if (!this.toolContext.historyManager) return;
    this.toolContext.historyManager.redo();
    this.historyChanged$.next();
  }

  // Delegate events to selected tool

  onPointerDown(event: PointerEvent): boolean {
    if (this.isContextReady()) return this.activeTool.onPointerDown(event, this.toolContext);
    return false;
  }

  onPointerUp(event: PointerEvent): boolean {
    if (this.isContextReady()) return this.activeTool.onPointerUp(event, this.toolContext);
    return false;
  }

  onPointerMove(event: PointerEvent): boolean {
    if (this.isContextReady()) return this.activeTool.onPointerMove(event, this.toolContext);
    return false;
  }

  renderActiveToolOverlay(ctx: CanvasRenderingContext2D): void {
    if (!this.isContextReady()) return;
    this.activeTool.renderOverlay?.(ctx, this.toolContext);
  }
}
