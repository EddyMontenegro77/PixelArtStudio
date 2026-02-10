import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { GridModel } from '../../models/grid.model';
import { ToolManagerService } from '../../services/tool-manager.service';
import { ProjectService } from '../../services/project.service';
import { FrameModel } from '../../models/frame.model';
import { LayerModel } from '../../models/layer.model';

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

  private canvas: HTMLCanvasElement | null = null;
  private canvasContext: CanvasRenderingContext2D | null = null;
  isViewReady: boolean = false;

  // Event Attributes
  isPointerDown: boolean = false;
  activeFrame!: FrameModel;
  activeLayer!: LayerModel;

  @ViewChild('gridCanvas') gridCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private toolManagerService: ToolManagerService,
    private projectService: ProjectService,
  ) {
    this.projectService.project$.subscribe((project) => {
      if (!project) return;
      this.width = project.width;
      this.height = project.height;
      this.pixelSize = project.pixelSize;
      this.activeFrame = project.getActiveFrame();
      this.activeLayer = this.activeFrame.getActiveLayer();

      if (this.isViewReady) {
        this.configureCanvas();
        this.renderFrame();
      }
    });
  }

  ngAfterViewInit() {
    this.isViewReady = true;
    this.configureCanvas();
    this.renderFrame();
  }

  configureCanvas(): void {
    this.canvas = this.gridCanvas.nativeElement;
    this.canvasContext = this.canvas.getContext('2d');

    this.canvas.width = this.width * this.pixelSize;
    this.canvas.height = this.height * this.pixelSize;
  }

  renderFrame(): void {
    if (!this.canvasContext || !this.activeFrame) return;

    this.canvasContext.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

    const layerList = this.activeFrame.getLayers();
    layerList.forEach((layer) => {
      if (layer.isVisible()) this.renderGrid(layer.getGrid());
    });
  }

  renderGrid(grid: GridModel): void {
    const pixels = grid.getPixels();
    for (let yIndex = 0; yIndex < grid.getHeight(); yIndex++) {
      for (let xIndex = 0; xIndex < grid.getWidth(); xIndex++) {
        const color = pixels[xIndex][yIndex];
        this.renderPixel(xIndex, yIndex, color);
      }
    }
  }

  renderPixel(xIndex: number, yIndex: number, color: string): void {
    if (!this.canvasContext || color == 'transparent') return;
    this.canvasContext.fillStyle = color;
    this.canvasContext.fillRect(
      xIndex * this.pixelSize,
      yIndex * this.pixelSize,
      this.pixelSize,
      this.pixelSize,
    );
  }

  // Event handlers

  onPointerDown(event: PointerEvent): void {
    const changed = this.toolManagerService.onPointerDown(event);
    if (changed) this.renderFrame();
  }

  onPointerUp(event: PointerEvent): void {
    const changed = this.toolManagerService.onPointerUp(event);
    if (changed) this.renderFrame();
  }

  onPointermove(event: PointerEvent): void {
    if (!this.canvas) return;
    const changed = this.toolManagerService.onPointerMove(event);
    if (changed) this.renderFrame();
  }

  // Getters and Setters

  setPixelSize(size: number): void {
    this.pixelSize = size;
    this.configureCanvas();
  }

  getPixelSize(): number {
    return this.pixelSize;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}
