import { Component } from '@angular/core';
import { ToolManagerService } from '../../services/tool-manager.service';
import { Tool, ToolType, TOOL_KEYBINDS_BY_TYPE } from '../../types/tool.interface';
import { ToolItem } from './tool-item/tool-item';

@Component({
  selector: 'app-toolbar',
  imports: [ToolItem],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {
  tools: { type: ToolType; tool: Tool }[] = [];
  toolKeybinds = TOOL_KEYBINDS_BY_TYPE;
  readonly minBrushSize = 1;
  readonly maxBrushSize = 16;

  constructor(private toolManagerService: ToolManagerService) {
    this.tools = this.toolManagerService.getTools();
  }

  selectTool(type: ToolType) {
    this.toolManagerService.setActiveTool(type);
  }

  isActiveTool(type: ToolType): boolean {
    const activeTool = this.toolManagerService.getActiveTool();
    const current = this.tools.find((item) => item.type === type);
    return !!current && current.tool.name === activeTool.name;
  }

  getBrushSize(): number {
    return this.toolManagerService.getBrushSize();
  }

  onBrushSizeInput(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    const clamped = Math.max(this.minBrushSize, Math.min(this.maxBrushSize, Math.round(parsed)));
    this.toolManagerService.setBrushSize(clamped);
  }

  getCurrentColor(): string {
    return this.toolManagerService.getFillColor();
  }
}
