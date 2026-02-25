import { GridModel } from './Grid.model';

export class LayerModel {
  private static layerCounter: number = 0;
  private layerId: number;
  private name: string;
  private grid: GridModel;
  private visible: boolean;
  private opacity: number;
  private locked: boolean;

  constructor(width: number, height: number, name?: string) {
    this.layerId = this.generateId();
    this.name = name || `Layer ${this.layerId}`;
    this.grid = new GridModel(width, height);
    this.visible = true;
    this.opacity = 1.0;
    this.locked = false;
  }

  generateId(): number {
    return LayerModel.layerCounter++;
  }

  // Getters and Setters

  getId(): number {
    return this.layerId;
  }

  getName(): string {
    return this.name;
  }
  setName(name: string): void {
    this.name = name;
  }

  getGrid(): GridModel {
    return this.grid;
  }
  setGrid(grid: GridModel): void {
    this.grid = grid;
  }
  isVisible(): boolean {
    return this.visible;
  }
  setVisible(visible: boolean): void {
    this.visible = visible;
  }
  getOpacity(): number {
    return this.opacity;
  }
  setOpacity(opacity: number): void {
    this.opacity = opacity;
  }
  isLocked(): boolean {
    return this.locked;
  }
  setLocked(locked: boolean): void {
    this.locked = locked;
  }
}
