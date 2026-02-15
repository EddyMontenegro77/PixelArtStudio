import { Component } from '@angular/core';
import { ToolManagerService } from '../../services/tool-manager.service';
import { ExportMode, ExportService } from '../../services/export.service';

@Component({
  selector: 'app-settingsbar',
  imports: [],
  templateUrl: './settingsbar.html',
  styleUrl: './settingsbar.scss',
})
export class Settingsbar {
  isExportPopupOpen: boolean = false;

  constructor(
    private toolManagerService: ToolManagerService,
    private exportService: ExportService,
  ) {}

  saveProject(): void {
    // Figure out logic after
  }

  openExportPopup(): void {
    this.isExportPopupOpen = true;
  }

  closeExportPopup(): void {
    this.isExportPopupOpen = false;
  }

  exportProject(mode: ExportMode): void {
    this.exportService.exportProject(mode);
    this.closeExportPopup();
  }

  undo(): void {
    this.toolManagerService.handleUndo();
  }

  redo(): void {
    this.toolManagerService.handleRedo();
  }
}
