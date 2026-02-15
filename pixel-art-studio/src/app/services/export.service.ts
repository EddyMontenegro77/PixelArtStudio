import { Injectable } from '@angular/core';
import { ProjectService } from './project.service';
import { FrameModel } from '../models/frame.model';
import { renderVisibleLayers } from '../components/canvas/canvas-render.utils';

export type ExportMode = 'ACTIVE_FRAME' | 'ALL_FRAMES' | 'GIF_ANIMATION' | 'APNG_ANIMATION';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(private projectService: ProjectService) {}

  async exportProject(mode: ExportMode): Promise<void> {
    if (mode === 'ACTIVE_FRAME') return this.exportActiveFrame();
    if (mode === 'ALL_FRAMES') return this.exportAllFrames();
    if (mode === 'GIF_ANIMATION') return this.exportGifAnimation();
    if (mode === 'APNG_ANIMATION') return this.exportApngAnimation();
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

  private async exportGifAnimation(): Promise<void> {
    /*
    Frame => Canvas => RGBA Arr =>
    Quantize colors => Apply palette =>
    write Frame => Download
    */
    const { GIFEncoder, quantize, applyPalette } = await import('gifenc');

    const project = this.projectService.getProject();
    const frames = this.projectService.getFrames();
    if (frames.length === 0) return;

    const width = frames[0].getWidth();
    const height = frames[0].getHeight();
    const encoder = GIFEncoder();

    for (const frame of frames) {
      const frameCanvas = this.createFrameCanvas(frame);
      const context = frameCanvas.getContext('2d');
      if (!context) continue;

      const imageData = context.getImageData(0, 0, width, height);
      const rgba = new Uint8Array(imageData.data.buffer); // Pixels as RGBA array
      const palette = quantize(rgba, 256);
      const indexedPixels = applyPalette(rgba, palette);
      const delayMs = Math.max(10, frame.getDuration());
      const delayCentiseconds = Math.max(1, Math.round(delayMs / 10));

      encoder.writeFrame(indexedPixels, width, height, {
        palette,
        delay: delayCentiseconds,
      });
    }

    encoder.finish();
    const gifBytes = encoder.bytes();
    const gifBytesSafe = Uint8Array.from(gifBytes);
    const gifBlob = new Blob([gifBytesSafe], { type: 'image/gif' });
    this.downloadBlob(gifBlob, `${project.name}_animation.gif`);
  }

  private async exportApngAnimation(): Promise<void> {
    /*
    Frame => Canvas => RGBA Arr
    Save buffers => repeat =>
    Encode => download
    */
    const { default: UPNG } = await import('upng-js');

    const project = this.projectService.getProject();
    const frames = this.projectService.getFrames();
    if (frames.length === 0) return;

    const width = frames[0].getWidth();
    const height = frames[0].getHeight();
    const buffers: ArrayBuffer[] = [];
    const delays: number[] = [];

    for (const frame of frames) {
      const frameCanvas = this.createFrameCanvas(frame);
      const context = frameCanvas.getContext('2d');
      if (!context) continue;

      const imageData = context.getImageData(0, 0, width, height);
      const bytes = new Uint8Array(imageData.data);
      buffers.push(bytes.buffer.slice(0)); // Push buffer copy
      delays.push(Math.max(10, frame.getDuration()));
    }

    if (buffers.length === 0) return;

    const encoded = UPNG.encode(buffers, width, height, 0, delays);
    const apngBlob = new Blob([encoded], { type: 'image/png' });
    this.downloadBlob(apngBlob, `${project.name}_animation.png`);
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
    const dataUrl = canvas.toDataURL('image/png');
    this.downloadDataUrl(dataUrl, filename);
  }

  private downloadDataUrl(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    this.downloadDataUrl(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
