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

  constructor(private toolManagerService: ToolManagerService) {
    this.tools = this.toolManagerService.getTools();
  }

  selectTool(type: ToolType) {}
}
