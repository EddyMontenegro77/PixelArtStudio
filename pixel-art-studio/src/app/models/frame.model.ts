import { LayerModel } from './layer.model';

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
    this.activeLayerId = newLayer.getId();
  }

  removeLayer(layerId: number): void {
    this.layers = this.layers.filter((layer) => layer.getId() !== layerId);
    if (this.activeLayerId === layerId && this.layers.length > 0) {
      this.activeLayerId = this.layers[0].getId();
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
    this.activeLayerId = layerId;
  }
}
