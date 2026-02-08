export class GridModel {
  private width: number = 16;
  private height: number = 16;
  private pixels: string[][] = [];

  constructor(width: number = 16, height: number = 16) {
    this.width = width;
    this.height = height;
    this.initializeGrid();
  }

  initializeGrid() {
    this.pixels = new Array(this.height)
      .fill(null)
      .map(() => new Array(this.width).fill('#FFFFFFFF'));
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

  getPixelColor(row: number, column: number): string {
    return this.pixels[row][column];
  }

  setPixelColor(row: number, column: number, color: string): void {
    this.pixels[row][column] = color;
  }
}
