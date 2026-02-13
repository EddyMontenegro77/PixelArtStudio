import { Component, ViewChild } from '@angular/core';
import { FrameModel } from '../../models/frame.model';
import { ProjectService } from '../../services/project.service';
import { AnimationPreview } from '../animation-preview/animation-preview';

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

  constructor(private projectService: ProjectService) {
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
    this.isPlaying = this.animationPreview.togglePlayback();
  }
}
