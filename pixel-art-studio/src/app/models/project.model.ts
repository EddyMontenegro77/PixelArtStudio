import { FrameModel } from './frame.model';

export interface ProjectSnapshot {
  frames: FrameModel[];
  activeFrameId: number;
}

export class ProjectModel {
  name: string;
  frames: FrameModel[] = [];
  activeFrameId: number;
  width: number;
  height: number;
  pixelSize: number;

  constructor(width: number, height: number, name: string) {
    this.name = name;
    this.width = width;
    this.height = height;
    this.pixelSize = 8;
    const newFrame = new FrameModel(width, height);
    this.frames.push(newFrame);
    this.activeFrameId = newFrame.getId();
  }

  addFrame(): void {
    const newFrame = new FrameModel(this.width, this.height);
    this.frames.push(newFrame);
    this.setActiveFrameId(newFrame.getId());
  }

  removeFrame(frameId: number): void {
    const wasActive = this.activeFrameId === frameId;

    this.frames = this.frames.filter((frame) => frame.getId() !== frameId);

    if (this.frames.length === 0) {
      this.addFrame();
      return;
    }

    if (wasActive) {
      this.activeFrameId = this.frames[0].getId();
    }
  }

  getActiveFrame(): FrameModel {
    const frame = this.frames.find((frame) => frame.getId() === this.activeFrameId);
    if (!frame) throw new Error('No active frame found');
    return frame;
  }

  getActiveFrameId(): number {
    return this.activeFrameId;
  }

  setActiveFrameId(frameId: number) {
    const exists = this.frames.some((frame) => frame.getId() === frameId);
    if (!exists) {
      throw new Error(`Frame ${frameId} not found in project`);
    }
    this.activeFrameId = frameId;
  }

  createSnapshot(): ProjectSnapshot {
    return {
      frames: [...this.frames],
      activeFrameId: this.activeFrameId,
    };
  }

  restoreSnapshot(snapshot: ProjectSnapshot): void {
    this.frames = [...snapshot.frames];
    this.activeFrameId = snapshot.activeFrameId;
  }
}
