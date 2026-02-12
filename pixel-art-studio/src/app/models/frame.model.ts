import { LayerModel } from './layer.model';

export interface FrameSnapshot {
  layers: LayerModel[];
  activeLayerId: number;
}

export class FrameModel {
  private static frameCounter: number = 0;
  private frameId: number;
  private activeLayerId: number;
  private layers: LayerModel[] = [];
  private msDuration: number;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.msDuration = 100;
    this.frameId = this.generateId();
    const newLayer = new LayerModel(this.width, this.height, 'Layer 1');
    this.layers.push(newLayer);
    this.activeLayerId = newLayer.getId();
  }

  generateId(): number {
    return FrameModel.frameCounter++;
  }

  addLayer(): void {
    const newLayer = new LayerModel(this.width, this.height, `Layer ${this.layers.length + 1}`);
    this.layers.push(newLayer);
    this.setActiveLayer(newLayer.getId());
  }

  removeLayer(layerId: number): void {
    const wasActive = this.activeLayerId === layerId;
    this.layers = this.layers.filter((layer) => layer.getId() !== layerId);

    if (this.layers.length === 0) {
      this.addLayer();
      return;
    }

    if (wasActive) {
      this.setActiveLayer(this.layers[0].getId());
    }
  }

  setDuration(ms: number): void {
    this.msDuration = ms;
  }

  getDuration(): number {
    return this.msDuration;
  }

  getLayers(): LayerModel[] {
    return this.layers;
  }

  getId(): number {
    return this.frameId;
  }

  getActiveLayer(): LayerModel {
    const layer = this.layers.find((layer) => layer.getId() === this.activeLayerId);
    if (!layer) throw new Error('No active layer found');
    return layer;
  }

  setActiveLayer(layerId: number): void {
    const exists = this.layers.some((layer) => layer.getId() === layerId);
    if (!exists) {
      throw new Error(`Layer ${layerId} not found in frame ${this.frameId}`);
    }
    this.activeLayerId = layerId;
  }

  createSnapshot(): FrameSnapshot {
    return {
      layers: [...this.layers],
      activeLayerId: this.activeLayerId,
    };
  }

  restoreSnapshot(snapshot: FrameSnapshot): void {
    this.layers = [...snapshot.layers];
    this.activeLayerId = snapshot.activeLayerId;
  }
}
