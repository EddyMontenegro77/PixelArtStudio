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

  moveLayerUp(layerId: number): void {
    const index = this.findLayerIndex(layerId);
    if (index <= 0) return;
    const [layer] = this.layers.splice(index, 1);
    this.layers.splice(index - 1, 0, layer);
  }

  moveLayerDown(layerId: number): void {
    const index = this.findLayerIndex(layerId);
    if (index < 0 || index >= this.layers.length - 1) return;
    const [layer] = this.layers.splice(index, 1);
    this.layers.splice(index + 1, 0, layer);
  }

  toggleLayerVisibility(layerId: number): void {
    const layer = this.layers.find((currentLayer) => currentLayer.getId() === layerId);
    if (!layer) {
      throw new Error(`Layer ${layerId} not found in frame ${this.frameId}`);
    }
    layer.setVisible(!layer.isVisible());
  }

  setDuration(ms: number): void {
    this.msDuration = ms;
  }

  getDuration(): number {
    return this.msDuration;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getLayers(): LayerModel[] {
    return this.layers;
  }

  getId(): number {
    return this.frameId;
  }

  getOnionSkinMatrix(opacity: string): string[][] {
    const layers = this.getLayers();
    const gridHeight = layers[0].getGrid().getPixels().length;
    const gridWidth = layers[0].getGrid().getPixels()[0].length;

    const onionSkinMatrix: string[][] = Array.from({ length: gridHeight }, () =>
      new Array<string>(gridWidth).fill('transparent'),
    );

    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
      if (!layers[layerIndex].isVisible()) continue;
      const grid = layers[layerIndex].getGrid();
      const gridPixels = grid.getPixels().slice();

      for (let pixelRowIndex = 0; pixelRowIndex < gridPixels.length; pixelRowIndex++) {
        let pixelRow = gridPixels[pixelRowIndex];

        for (let pixelIndex = 0; pixelIndex < pixelRow.length; pixelIndex++) {
          if (!(pixelRow[pixelIndex] == 'transparent')) {
            onionSkinMatrix[pixelIndex][pixelRowIndex] = pixelRow[pixelIndex].slice(0, 7) + opacity;
          }
          continue;
        }
      }
    }

    return onionSkinMatrix;
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

  private findLayerIndex(layerId: number): number {
    return this.layers.findIndex((layer) => layer.getId() === layerId);
  }
}
