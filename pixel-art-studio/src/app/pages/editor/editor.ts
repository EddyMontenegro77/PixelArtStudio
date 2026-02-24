import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Canvas } from '../../components/canvas/canvas';
import { ToolManagerService } from '../../services/tool-manager.service';
import { Toolbar } from '../../components/toolbar/toolbar';
import { Projectbar } from '../../components/projectbar/projectbar';
import { Settingsbar } from '../../components/settingsbar/settingsbar';
import { Framesbar } from '../../components/framesbar/framesbar';
import { TOOL_KEYBINDS } from '../../types/tool.interface';

@Component({
  selector: 'app-editor',
  imports: [FormsModule, RouterLink, Canvas, Toolbar, Projectbar, Settingsbar, Framesbar],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class Editor {
  projectName: string = 'My Project';
  width: number = 32;
  height: number = 32;
  isInitialized: boolean = false;

  constructor(
    private projectService: ProjectService,
    private toolManagerService: ToolManagerService,
  ) {}

  ngOnInit(): void {
    if (this.projectService.hasProject()) {
      this.isInitialized = true;
      return;
    }

    if (this.projectService.loadProjectFromLocalDraft()) {
      this.isInitialized = true;
    }
  }

  initializeCanvas(): void {
    if (this.width > 0 && this.height > 0 && this.projectName.length > 0) {
      this.projectService.createNewProject(this.width, this.height, this.projectName);
      this.isInitialized = true;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
    ) {
      return;
    }

    const ctrlOrMeta = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    const isUndo = ctrlOrMeta && !event.shiftKey && key === 'z';
    const isRedo = ctrlOrMeta && ((event.shiftKey && key === 'z') || key === 'y');
    const isSave = ctrlOrMeta && key === 's';

    if (isUndo) {
      event.preventDefault();
      event.stopPropagation();
      this.toolManagerService.handleUndo();
      return;
    }

    if (isRedo) {
      event.preventDefault();
      event.stopPropagation();
      this.toolManagerService.handleRedo();
      return;
    }

    if (isSave && this.isInitialized) {
      event.preventDefault();
      event.stopPropagation();
      void this.projectService.saveProject();
      return;
    }

    if (!this.isInitialized || ctrlOrMeta || event.altKey) {
      return;
    }

    const toolType = TOOL_KEYBINDS[event.key.toUpperCase()];
    if (toolType) {
      event.preventDefault();
      event.stopPropagation();
      this.toolManagerService.setActiveTool(toolType);
    }
  }
}
