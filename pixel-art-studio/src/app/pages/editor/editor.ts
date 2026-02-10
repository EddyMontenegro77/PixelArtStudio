import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Canvas } from '../../components/canvas/canvas';
import { ToolManagerService } from '../../services/tool-manager.service';

@Component({
  selector: 'app-editor',
  imports: [FormsModule, Canvas],
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

  initializeCanvas(): void {
    if (this.width > 0 && this.height > 0 && this.projectName.length > 0) {
      this.projectService.createNewProject(this.width, this.height, this.projectName);
      this.isInitialized = true;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'z') {
      event.preventDefault();
      console.log('undo()');
      this.toolManagerService.handleUndo();
    }
    if (
      (event.ctrlKey && event.ctrlKey && event.key == 'Z') ||
      (event.ctrlKey && event.key === 'y')
    ) {
      event.preventDefault();
      console.log('redo()');
      this.toolManagerService.handleRedo();
    }
  }
}
