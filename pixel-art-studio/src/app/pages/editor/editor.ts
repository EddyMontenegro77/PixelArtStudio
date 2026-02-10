import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Canvas } from '../../components/canvas/canvas';

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

  constructor(private projectService: ProjectService) {}

  initializeCanvas(): void {
    if (this.width > 0 && this.height > 0 && this.projectName.length > 0) {
      this.projectService.createNewProject(this.width, this.height, this.projectName);
      this.isInitialized = true;
    }
  }
}
