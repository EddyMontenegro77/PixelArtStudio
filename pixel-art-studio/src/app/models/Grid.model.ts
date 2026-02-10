export class GridModel {
  private width: number;
  private height: number;
  private pixels: string[][] = [];

  constructor(width: number = 16, height: number = 16) {
    this.width = width;
    this.height = height;
    this.initializeGrid();
  }

  initializeGrid() {
    this.pixels = new Array(this.height)
      .fill(null)
      .map(() => new Array(this.width).fill('transparent'));
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getPixels(): string[][] {
    return this.pixels;
  }

  setPixels(pixels: string[][]): void {
    this.pixels = pixels;
  }

  getPixelColor(x: number, y: number): string {
    return this.pixels[x][y];
  }

  setPixelColor(x: number, y: number, color: string): void {
    this.pixels[x][y] = color;
  }
}
