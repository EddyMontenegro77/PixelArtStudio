import { Injectable } from '@angular/core';
import { ProjectService } from './project.service';
import { FrameModel } from '../models/frame.model';
import { renderVisibleLayers } from '../components/canvas/canvas-render.utils';

export type ExportMode = 'ACTIVE_FRAME' | 'ALL_FRAMES';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(private projectService: ProjectService) {}

  exportProject(mode: ExportMode): void {
    if (mode === 'ACTIVE_FRAME') {
      this.exportActiveFrame();
      return;
    }
    this.exportAllFrames();
  }

  exportActiveFrame(): void {
    const project = this.projectService.getProject();
    const frame = project.getActiveFrame();
    const canvas = this.createFrameCanvas(frame);
    this.downloadCanvas(canvas, `${project.name}_frame_${frame.getId()}.png`);
  }

  exportAllFrames(): void {
    const project = this.projectService.getProject();
    const frames = this.projectService.getFrames();
    if (frames.length === 0) return;

    const frameWidth = frames[0].getWidth();
    const frameHeight = frames[0].getHeight();
    const canvas = document.createElement('canvas');
    canvas.width = frameWidth * frames.length;
    canvas.height = frameHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    frames.forEach((frame, index) => {
      const frameCanvas = this.createFrameCanvas(frame);
      context.drawImage(frameCanvas, index * frameWidth, 0);
    });

    this.downloadCanvas(canvas, `${project.name}_spritesheet.png`);
  }

  private createFrameCanvas(frame: FrameModel): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = frame.getWidth();
    canvas.height = frame.getHeight();

    const context = canvas.getContext('2d');
    if (!context) return canvas;

    context.clearRect(0, 0, canvas.width, canvas.height);
    renderVisibleLayers(context, frame, 1);
    return canvas;
  }

  private downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
  }
}
