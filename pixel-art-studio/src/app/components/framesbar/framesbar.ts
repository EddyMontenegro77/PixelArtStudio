import { Component, ViewChild } from '@angular/core';
import { FrameModel } from '../../models/frame.model';
import { ProjectService } from '../../services/project.service';
import { AnimationPreview } from '../animation-preview/animation-preview';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-framesbar',
  imports: [AnimationPreview],
  templateUrl: './framesbar.html',
  styleUrl: './framesbar.scss',
})
export class Framesbar {
  @ViewChild(AnimationPreview) animationPreview!: AnimationPreview;

  frames: FrameModel[] = [];
  activeFrameId: number | null = null;
  isPlaying: boolean = false;
  isPreviewOpen = false;

  constructor(
    private projectService: ProjectService,
    private themeService: ThemeService,
  ) {
    this.projectService.project$.subscribe((project) => {
      if (!project) return;
      this.frames = this.projectService.getFrames();
      this.activeFrameId = this.projectService.getActiveFrameId();
    });
  }

  addFrame(): void {
    this.projectService.addFrame();
  }

  removeFrame(frameId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.projectService.removeFrame(frameId);
  }

  selectFrame(frameId: number): void {
    this.projectService.setActiveFrame(frameId);
  }

  updateFrameDuration(frameId: number, event: Event): void {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    const nextDuration = Number(input.value);
    this.projectService.setFrameDuration(frameId, nextDuration);
  }

  togglePlaying(): void {
    if (!this.animationPreview) return;
    this.animationPreview.togglePlayback();
  }

  onPlaybackChanged(isPlaying: boolean): void {
    this.isPlaying = isPlaying;
  }

  openPreview(): void {
    this.isPreviewOpen = true;
    queueMicrotask(() => {
      this.togglePlaying();
    });
  }

  closePreview(): void {
    if (this.animationPreview && this.isPlaying) {
      this.animationPreview.togglePlayback();
    }
    this.isPreviewOpen = false;
  }

  getPanelIconPath(name: 'plus' | 'play_pause' | 'minus'): string {
    const suffix = this.themeService.getTheme() === 'dark' ? 'white' : 'black';
    return `/icons/${name}_${suffix}.svg`;
  }

  getAccentIconPath(name: 'plus' | 'play_pause' | 'minus'): string {
    // bg-btn uses opposite contrast compared to panel buttons
    const suffix = this.themeService.getTheme() === 'dark' ? 'black' : 'white';
    return `/icons/${name}_${suffix}.svg`;
  }
}
