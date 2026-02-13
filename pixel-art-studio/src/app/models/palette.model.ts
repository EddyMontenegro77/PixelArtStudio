export interface PaletteSnapshot {
  name: string;
  colors: string[];
}

export class PaletteModel {
  private name: string;
  private colors: string[];

  constructor(name: string) {
    this.name = name;
    this.colors = ['#00000000', '#ffffffff'];
  }

  setPaletteName(newName: string): void {
    this.name = newName;
  }

  getPaletteName(): string {
    return this.name;
  }

  getColors(): string[] {
    return [...this.colors];
  }

  addColor(color: string): void {
    this.colors.push(color);
  }

  removeColor(colorIndex: number): void {
    if (colorIndex < 0 || colorIndex >= this.colors.length) return;
    if (this.colors.length === 1) {
      this.colors[0] = '#00000000';
      return;
    }
    this.colors.splice(colorIndex, 1);
  }

  updateColor(colorIndex: number, newColor: string): void {
    if (colorIndex < 0 || colorIndex >= this.colors.length) return;
    this.colors[colorIndex] = newColor;
  }

  createSnapshot(): PaletteSnapshot {
    return {
      name: this.name,
      colors: [...this.colors],
    };
  }

  restoreSnapshot(snapshot: PaletteSnapshot): void {
    this.name = snapshot.name;
    this.colors = [...snapshot.colors];
  }
}
