import { FrameModel } from './frame.model';

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

  addFrame() {}
  removeFrame() {}

  getActiveFrame(): FrameModel {
    const frame = this.frames.find((frame) => frame.getId() === this.activeFrameId);
    if (!frame) throw new Error('No active frame found');
    return frame;
  }

  getActiveFrameId(): number {
    return this.activeFrameId;
  }

  setActiveFrameId(frameId: number) {
    this.activeFrameId = frameId;
  }
}
