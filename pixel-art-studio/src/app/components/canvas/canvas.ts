import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { GridModel } from '../../models/Grid.model';

@Component({
  selector: 'app-canvas',
  imports: [],
  templateUrl: './canvas.html',
  styleUrl: './canvas.scss',
})
export class Canvas {
  private width: number = 32;
  private height: number = 32;
  private pixelSize: number = 8;
  private fillColor: string = '#000000FF';

  private canvas: HTMLCanvasElement | null = null;
  private canvasContext: CanvasRenderingContext2D | null = null;
  private grid: GridModel = new GridModel(this.width, this.height);

  // Event Attributes
  isPointerDown: boolean = false;

  @ViewChild('gridCanvas') gridCanvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    this.configureCanvas();
  }

  configureCanvas() {
    this.canvas = this.gridCanvas.nativeElement;
    this.canvasContext = this.canvas.getContext('2d');

    this.canvas.width = this.width * this.pixelSize;
    this.canvas.height = this.height * this.pixelSize;
    this.setFillColor(this.fillColor);
  }

  getGridCoordinates(xOffset: number, yOffset: number): { x: number; y: number } {
    const x = Math.floor(xOffset / this.pixelSize);
    const y = Math.floor(yOffset / this.pixelSize);
    return { x, y };
  }

  paintPixel(x: number, y: number, color: string) {
    if (!this.canvasContext) return;
    this.canvasContext.fillRect(
      x * this.pixelSize,
      y * this.pixelSize,
      this.pixelSize,
      this.pixelSize,
    );
    this.grid.setPixelColor(x, y, color);
  }

  // Event handlers

  onClick(event: MouseEvent) {
    if (!this.canvas) return;
    const { x, y } = this.getGridCoordinates(event.offsetX, event.offsetY);
    this.paintPixel(x, y, this.fillColor);
  }

  onPointerDown(event: PointerEvent) {
    this.isPointerDown = true;
  }

  onPointerUp(event: PointerEvent) {
    this.isPointerDown = false;
  }

  onPointermove(event: PointerEvent) {
    if (!this.isPointerDown) return;
    if (!this.canvas) return;
    const { x, y } = this.getGridCoordinates(event.offsetX, event.offsetY);
    this.paintPixel(x, y, this.fillColor);
  }

  // Getters and Setters

  getFillColor(): string {
    return this.fillColor;
  }

  setFillColor(color: string) {
    this.fillColor = color;
    this.canvasContext!.fillStyle = color;
  }

  setPixelSize(size: number) {
    this.pixelSize = size;
    this.configureCanvas();
  }

  getPixelSize(): number {
    return this.pixelSize;
  }

  setWidth(width: number) {
    this.width = width;
    this.grid = new GridModel(this.width, this.height);
    this.configureCanvas();
  }
  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  setHeight(height: number) {
    this.height = height;
    this.grid = new GridModel(this.width, this.height);
    this.configureCanvas();
  }

  getGrid(): GridModel {
    return this.grid;
  }
}
