import { Injectable } from '@angular/core';
import { ProjectService } from './project.service';
import { FrameModel } from '../models/frame.model';
import { renderVisibleLayers } from '../components/canvas/canvas-render.utils';

export type ExportMode = 'ACTIVE_FRAME' | 'ALL_FRAMES' | 'GIF_ANIMATION' | 'APNG_ANIMATION';
export type ExportOptions = {
  filename?: string;
  scale?: number;
  fromFrame?: number;
  toFrame?: number;
};

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(private projectService: ProjectService) {}

  async exportProject(mode: ExportMode, options: ExportOptions = {}): Promise<void> {
    if (mode === 'ACTIVE_FRAME') return this.exportActiveFrame(options);
    if (mode === 'ALL_FRAMES') return this.exportAllFrames(options);
    if (mode === 'GIF_ANIMATION') return this.exportGifAnimation(options);
    if (mode === 'APNG_ANIMATION') return this.exportApngAnimation(options);
  }

  exportActiveFrame(options: ExportOptions = {}): void {
    const project = this.projectService.getProject();
    const frame = project.getActiveFrame();
    const scale = this.normalizeScale(options.scale);
    const canvas = this.createFrameCanvas(frame, scale);
    const filename = this.buildFilename(
      options.filename,
      `${project.name}_frame_${frame.getId()}_${scale}x`,
      'png',
    );
    this.downloadCanvas(canvas, filename);
  }

  exportAllFrames(options: ExportOptions = {}): void {
    const project = this.projectService.getProject();
    const scale = this.normalizeScale(options.scale);
    const frames = this.selectFramesInRange(
      this.projectService.getFrames(),
      options.fromFrame,
      options.toFrame,
    );
    if (frames.length === 0) return;

    const frameWidth = frames[0].getWidth() * scale;
    const frameHeight = frames[0].getHeight() * scale;
    const canvas = document.createElement('canvas');
    canvas.width = frameWidth * frames.length;
    canvas.height = frameHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    frames.forEach((frame, index) => {
      const frameCanvas = this.createFrameCanvas(frame, scale);
      context.drawImage(frameCanvas, index * frameWidth, 0);
    });

    const filename = this.buildFilename(
      options.filename,
      `${project.name}_spritesheet_${scale}x`,
      'png',
    );
    this.downloadCanvas(canvas, filename);
  }

  private async exportGifAnimation(options: ExportOptions = {}): Promise<void> {
    /*
    Frame => Canvas => RGBA Arr =>
    Quantize colors => Apply palette =>
    write Frame => Download
    */
    const { GIFEncoder, quantize, applyPalette } = await import('gifenc');

    const project = this.projectService.getProject();
    const scale = this.normalizeScale(options.scale);
    const frames = this.selectFramesInRange(
      this.projectService.getFrames(),
      options.fromFrame,
      options.toFrame,
    );
    if (frames.length === 0) return;

    const width = frames[0].getWidth() * scale;
    const height = frames[0].getHeight() * scale;
    const encoder = GIFEncoder();

    for (const frame of frames) {
      const frameCanvas = this.createFrameCanvas(frame, scale);
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
    const filename = this.buildFilename(
      options.filename,
      `${project.name}_animation_${scale}x`,
      'gif',
    );
    this.downloadBlob(gifBlob, filename);
  }

  private async exportApngAnimation(options: ExportOptions = {}): Promise<void> {
    /*
    Frame => Canvas => RGBA Arr
    Save buffers => repeat =>
    Encode => download
    */
    const { default: UPNG } = await import('upng-js');

    const project = this.projectService.getProject();
    const scale = this.normalizeScale(options.scale);
    const frames = this.selectFramesInRange(
      this.projectService.getFrames(),
      options.fromFrame,
      options.toFrame,
    );
    if (frames.length === 0) return;

    const width = frames[0].getWidth() * scale;
    const height = frames[0].getHeight() * scale;
    const buffers: ArrayBuffer[] = [];
    const delays: number[] = [];

    for (const frame of frames) {
      const frameCanvas = this.createFrameCanvas(frame, scale);
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
    const filename = this.buildFilename(
      options.filename,
      `${project.name}_animation_${scale}x`,
      'png',
    );
    this.downloadBlob(apngBlob, filename);
  }

  private createFrameCanvas(frame: FrameModel, scale: number = 1): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = frame.getWidth() * scale;
    canvas.height = frame.getHeight() * scale;

    const context = canvas.getContext('2d');
    if (!context) return canvas;

    context.clearRect(0, 0, canvas.width, canvas.height);
    renderVisibleLayers(context, frame, scale);
    return canvas;
  }

  private normalizeScale(scale: number | undefined): number {
    if (!scale || !Number.isFinite(scale)) return 1;
    return Math.max(1, Math.floor(scale));
  }

  private selectFramesInRange(
    frames: FrameModel[],
    fromFrame?: number,
    toFrame?: number,
  ): FrameModel[] {
    if (frames.length === 0) return [];
    const from = Math.max(1, Math.floor(fromFrame ?? 1));
    const to = Math.max(from, Math.floor(toFrame ?? frames.length));
    const startIndex = Math.min(from, frames.length) - 1;
    const endIndex = Math.min(to, frames.length) - 1;
    return frames.slice(startIndex, endIndex + 1);
  }

  private buildFilename(customName: string | undefined, fallbackBase: string, ext: string): string {
    const base = (customName ?? '').trim();
    if (!base) return `${fallbackBase}.${ext}`;
    const hasExt = base.toLowerCase().endsWith(`.${ext.toLowerCase()}`);
    return hasExt ? base : `${base}.${ext}`;
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
