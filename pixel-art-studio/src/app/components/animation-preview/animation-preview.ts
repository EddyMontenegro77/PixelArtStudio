import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { FrameModel } from '../../models/frame.model';
import { ProjectService } from '../../services/project.service';
import { Subscription } from 'rxjs';
import { renderCheckerboard, renderVisibleLayers } from '../canvas/canvas-render.utils';
import { GridModel } from '../../models/Grid.model';

@Component({
  selector: 'app-animation-preview',
  imports: [],
  templateUrl: './animation-preview.html',
  styleUrl: './animation-preview.scss',
})
export class AnimationPreview {
  @ViewChild('animationCanvas') animationCanvas!: ElementRef<HTMLCanvasElement>;
  @Output() playbackChanged = new EventEmitter<boolean>();

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
        this.stop();
        this.frames = [];
        this.currentFrameIndex = 0;
        this.clearCanvas();
        return;
      }

      this.frames = this.projectService.getFrames();
      this.currentFrameIndex = Math.min(
        this.currentFrameIndex,
        Math.max(this.frames.length - 1, 0),
      );

      if (!this.canvasContext) return;

      if (this.frames.length === 0) {
        this.stop();
        this.clearCanvas();
        return;
      }

      if (this.isPlaying) {
        this.restartPlaybackTimer();
      } else {
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

    this.setPlayingState(true);
    this.playNext();
  }

  togglePlayback(): void {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
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
    this.setPlayingState(false);
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private configureCanvas(frame: FrameModel): void {
    const grid = this.getFrameGrid(frame);
    if (!grid) return;

    const canvas = this.animationCanvas.nativeElement;
    canvas.width = grid.getWidth() * this.previewPixelSize;
    canvas.height = grid.getHeight() * this.previewPixelSize;
  }

  private drawFrame(frame: FrameModel): void {
    if (!this.canvasContext) return;
    const grid = this.getFrameGrid(frame);
    if (!grid) {
      this.clearCanvas();
      return;
    }

    this.configureCanvas(frame);
    renderCheckerboard(
      this.canvasContext,
      grid.getWidth(),
      grid.getHeight(),
      this.previewPixelSize,
    );
    renderVisibleLayers(this.canvasContext, frame, this.previewPixelSize);
  }

  private getFrameGrid(frame: FrameModel): GridModel | null {
    const firstLayer = frame.getLayers()[0];
    return firstLayer ? firstLayer.getGrid() : null;
  }

  private restartPlaybackTimer(): void {
    if (!this.isPlaying || this.frames.length === 0) return;
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.playNext();
  }

  private setPlayingState(nextState: boolean): void {
    if (this.isPlaying === nextState) return;
    this.isPlaying = nextState;
    this.playbackChanged.emit(this.isPlaying);
  }

  private clearCanvas(): void {
    if (!this.canvasContext || !this.animationCanvas) return;
    const canvas = this.animationCanvas.nativeElement;
    this.canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  }
}
