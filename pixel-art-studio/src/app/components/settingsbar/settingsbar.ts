import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolManagerService } from '../../services/tool-manager.service';
import { ExportMode, ExportOptions, ExportService } from '../../services/export.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-settingsbar',
  imports: [FormsModule],
  templateUrl: './settingsbar.html',
  styleUrl: './settingsbar.scss',
})
export class Settingsbar {
  isExportPopupOpen: boolean = false;
  exportFilename: string = '';
  exportScale: number = 1;
  exportFromFrame: number = 1;
  exportToFrame: number = 1;

  constructor(
    private toolManagerService: ToolManagerService,
    private exportService: ExportService,
    private projectService: ProjectService,
  ) {}

  async saveProject(): Promise<void> {
    try {
      await this.projectService.saveProject();
    } catch (error) {
      console.error('Could not save project', error);
    }
  }

  openExportPopup(): void {
    const totalFrames = this.projectService.getFrames().length;
    this.exportFromFrame = 1;
    this.exportToFrame = totalFrames > 0 ? totalFrames : 1;
    this.isExportPopupOpen = true;
  }

  closeExportPopup(): void {
    this.isExportPopupOpen = false;
  }

  async exportProject(mode: ExportMode): Promise<void> {
    const options: ExportOptions = {
      filename: this.exportFilename,
      scale: this.exportScale,
      fromFrame: this.exportFromFrame,
      toFrame: this.exportToFrame,
    };
    await this.exportService.exportProject(mode, options);
    this.closeExportPopup();
  }

  undo(): void {
    this.toolManagerService.handleUndo();
  }

  redo(): void {
    this.toolManagerService.handleRedo();
  }
}
