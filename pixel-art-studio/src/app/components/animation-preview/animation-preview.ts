import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FrameModel } from '../../models/frame.model';
import { ProjectService } from '../../services/project.service';
import { Subscription } from 'rxjs';
import { renderCheckerboard, renderVisibleLayers } from '../canvas/canvas-render.utils';

@Component({
  selector: 'app-animation-preview',
  imports: [],
  templateUrl: './animation-preview.html',
  styleUrl: './animation-preview.scss',
})
export class AnimationPreview {
  @ViewChild('animationCanvas') animationCanvas!: ElementRef<HTMLCanvasElement>;

  isPlaying: boolean = false;
  currentFrameIndex: number = 0;
  timeoutId: ReturnType<typeof setTimeout> | null = null;
  frames: FrameModel[] = [];
  private canvasContext: CanvasRenderingContext2D | null = null;
  private readonly previewPixelSize = 4;
  private projectSubscription: Subscription;

  constructor(private projectService: ProjectService) {
    this.projectSubscription = this.projectService.project$.subscribe((project) => {
      if (!project) {
        this.frames = [];
        this.currentFrameIndex = 0;
        return;
      }
      this.frames = this.projectService.getFrames();
      this.currentFrameIndex = Math.min(
        this.currentFrameIndex,
        Math.max(this.frames.length - 1, 0),
      );

      if (this.canvasContext && this.frames.length > 0) {
        this.configureCanvas(this.frames[0]);
        this.drawFrame(this.frames[this.currentFrameIndex]);
      }
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.animationCanvas.nativeElement;
    this.canvasContext = canvas.getContext('2d');
    if (this.frames.length > 0) {
      this.configureCanvas(this.frames[0]);
      this.drawFrame(this.frames[this.currentFrameIndex]);
    }
  }

  ngOnDestroy(): void {
    this.stop();
    this.projectSubscription.unsubscribe();
  }

  play(): void {
    if (this.isPlaying || this.frames.length === 0) return;

    this.isPlaying = true;
    this.playNext();
  }

  togglePlayback(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  private playNext(): void {
    if (!this.isPlaying || this.frames.length === 0) return;

    const frame = this.frames[this.currentFrameIndex];
    this.drawFrame(frame);

    this.timeoutId = setTimeout(() => {
      this.playNextFrame();
      this.playNext();
    }, frame.getDuration());
  }

  playNextFrame(): void {
    if (this.frames.length === 0) return;
    this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length; // Avoids getting out of length
  }

  stop(): void {
    this.isPlaying = false;
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private configureCanvas(frame: FrameModel): void {
    const firstLayer = frame.getLayers()[0];
    const grid = firstLayer.getGrid();
    const canvas = this.animationCanvas.nativeElement;
    canvas.width = grid.getWidth() * this.previewPixelSize;
    canvas.height = grid.getHeight() * this.previewPixelSize;
  }

  private drawFrame(frame: FrameModel): void {
    if (!this.canvasContext) return;
    this.configureCanvas(frame);

    const firstLayer = frame.getLayers()[0];
    const grid = firstLayer.getGrid();
    renderCheckerboard(
      this.canvasContext,
      grid.getWidth(),
      grid.getHeight(),
      this.previewPixelSize,
    );
    renderVisibleLayers(this.canvasContext, frame, this.previewPixelSize);
  }
}
