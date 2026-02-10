import { Injectable } from '@angular/core';
import { Tool, ToolContext, ToolType } from '../models/tools/tool.interface';
import { PencilTool } from '../models/tools/pencil-tool.model';
import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root',
})
export class ToolManagerService {
  private tools: Map<ToolType, Tool> = new Map([[ToolType.PENCIL, new PencilTool()]]);
  private activeTool: Tool = this.tools.get(ToolType.PENCIL)!;

  private toolContext: ToolContext = {
    activeFrame: null,
    activeLayer: null,
    historyManager: null,
    fillColor: '#000000FF',
    pixelSize: 8,
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

  setPixelSize(size: number): void {
    this.toolContext.pixelSize = size;
  }

  private isContextReady(): boolean {
    return !!this.toolContext.activeLayer && !!this.toolContext.historyManager;
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
}
