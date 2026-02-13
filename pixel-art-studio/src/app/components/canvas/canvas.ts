import { Component, ViewChild, ElementRef } from '@angular/core';
import { GridModel } from '../../models/grid.model';
import { ToolManagerService } from '../../services/tool-manager.service';
import { ProjectService } from '../../services/project.service';
import { FrameModel } from '../../models/frame.model';
import { LayerModel } from '../../models/layer.model';
import { CanvasZoomService } from '../../services/canvas-zoom.service';
import {
  getCursorCanvasPosition,
  getCursorContainerPosition,
  updatePanToKeepPointUnderCursor,
} from './canvas.utils';
import { getBrushBounds } from '../../models/tools/brush.utils';
import { renderCheckerboard, renderVisibleLayers } from './canvas-render.utils';

@Component({
  selector: 'app-canvas',
  imports: [],
  templateUrl: './canvas.html',
  styleUrl: './canvas.scss',
})
export class Canvas {
  @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;

  private width: number = 32;
  private height: number = 32;
  private pixelSize: number = 8;
  private zoomScale: number = 1;

  // View Attributes
  private canvas: HTMLCanvasElement | null = null;
  private canvasContext: CanvasRenderingContext2D | null = null;
  isViewReady: boolean = false;

  isPanning = false;
  startX = 0;
  startY = 0;
  panX = 0;
  panY = 0;
  hoverX: number | null = null;
  hoverY: number | null = null;

  // Event Attributes
  isPointerDown: boolean = false;
  activeFrame!: FrameModel;
  activeLayer!: LayerModel;

  @ViewChild('gridCanvas') gridCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private toolManagerService: ToolManagerService,
    private projectService: ProjectService,
    private canvasZoomService: CanvasZoomService,
  ) {
    this.canvasZoomService.pixelSize$.subscribe((size) => {
      this.zoomScale = size / this.pixelSize;
      if (this.isViewReady) {
        this.configureCanvas();
        this.renderFrame();
        this.applyTransform();
      }
      this.toolManagerService.setPixelSize(this.pixelSize * this.zoomScale);
    });

    this.projectService.project$.subscribe((project) => {
      if (!project) return;
      this.width = project.width;
      this.height = project.height;
      this.activeFrame = project.getActiveFrame();
      this.activeLayer = this.activeFrame.getActiveLayer();

      if (this.isViewReady) {
        this.setInitialZoom();
        this.configureCanvas();
        this.renderFrame();
      }
    });

    this.toolManagerService.historyChanged$.subscribe(() => {
      this.renderFrame();
    });
  }

  ngAfterViewInit() {
    this.isViewReady = true;
    if (this.activeFrame) {
      this.setInitialZoom();
    }
    this.configureCanvas();
    this.renderFrame();
  }

  configureCanvas(): void {
    this.canvas = this.gridCanvas.nativeElement;
    this.canvasContext = this.canvas.getContext('2d');

    this.canvas.width = this.width * this.pixelSize;
    this.canvas.height = this.height * this.pixelSize;
    this.centerCanvas();
    this.applyTransform();
  }

  renderFrame(): void {
    if (!this.canvasContext || !this.activeFrame) return;

    renderCheckerboard(this.canvasContext, this.width, this.height, this.pixelSize);
    renderVisibleLayers(this.canvasContext, this.activeFrame, this.pixelSize);
    this.renderHover();
  }

  renderHover(): void {
    if (!this.canvasContext) return;
    if (this.hoverX === null || this.hoverY === null) return;

    const { startX, startY, size } = getBrushBounds(
      this.hoverX,
      this.hoverY,
      this.toolManagerService.getBrushSize(),
    );

    this.canvasContext.fillStyle = 'rgba(0,0,0,0.15)';
    this.canvasContext.fillRect(
      startX * this.pixelSize,
      startY * this.pixelSize,
      size * this.pixelSize,
      size * this.pixelSize,
    );

    this.canvasContext.strokeStyle = 'rgba(0,0,0,0.4)';
    this.canvasContext.strokeRect(
      startX * this.pixelSize,
      startY * this.pixelSize,
      size * this.pixelSize,
      size * this.pixelSize,
    );
  }

  // Event handlers

  onPointerDown(event: PointerEvent): void {
    if (this.isPanning) return;
    if (event.button !== 0) return;
    const changed = this.toolManagerService.onPointerDown(event);
    if (changed) this.renderFrame();
  }

  onPointerUp(event: PointerEvent): void {
    this.hoverX = null;
    this.hoverY = null;
    const changed = this.toolManagerService.onPointerUp(event);
    if (changed) this.renderFrame();
  }

  onPointermove(event: PointerEvent): void {
    if (this.isPanning) return;
    if (!this.canvas) return;

    const containerBounds = this.canvasContainer.nativeElement.getBoundingClientRect();
    const { cursorX, cursorY } = getCursorContainerPosition(event, containerBounds);
    const { canvasX, canvasY } = getCursorCanvasPosition(
      cursorX,
      cursorY,
      this.panX,
      this.panY,
      this.zoomScale,
    );
    this.hoverX = Math.floor(canvasX / this.pixelSize);
    this.hoverY = Math.floor(canvasY / this.pixelSize);

    const changed = this.toolManagerService.onPointerMove(event);
    this.renderFrame();
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();

    const container = this.canvasContainer.nativeElement;
    const containerBounds = container.getBoundingClientRect();

    const oldScale = this.zoomScale;
    const newSize = this.canvasZoomService.zoom(event.deltaY);
    const newScale = newSize / this.pixelSize;
    if (newScale === oldScale) return;

    const { cursorX, cursorY } = getCursorContainerPosition(event, containerBounds);

    const { canvasX, canvasY } = getCursorCanvasPosition(
      cursorX,
      cursorY,
      this.panX,
      this.panY,
      oldScale,
    );

    this.zoomScale = newScale;
    const { panX, panY } = updatePanToKeepPointUnderCursor(
      cursorX,
      cursorY,
      canvasX,
      canvasY,
      newScale,
    );
    this.panX = panX;
    this.panY = panY;
    this.applyTransform();
  }

  onPanStart(event: PointerEvent) {
    if (event.button !== 1) return; // middle button
    this.isPanning = true;

    this.startX = event.clientX;
    this.startY = event.clientY;
    event.preventDefault();
    event.stopPropagation();
  }

  onPanMove(event: PointerEvent) {
    if (!this.isPanning) return;
    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;
    this.panX += dx;
    this.panY += dy;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.applyTransform();
  }

  onPanEnd() {
    this.isPanning = false;
  }

  setPixelSize(size: number): void {
    this.pixelSize = size;
    this.configureCanvas();
  }

  private applyTransform(): void {
    if (!this.canvas) return;
    this.canvas.style.transformOrigin = 'top left';
    this.canvas.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomScale})`;
  }

  private centerCanvas(): void {
    if (!this.canvasContainer || !this.canvas) return;
    const container = this.canvasContainer.nativeElement;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const canvasW = this.canvas.width * this.zoomScale;
    const canvasH = this.canvas.height * this.zoomScale;

    // Calculate panning for centering
    this.panX = Math.max(0, (containerW - canvasW) / 2);
    this.panY = Math.max(0, (containerH - canvasH) / 2);
  }

  private setInitialZoom(): void {
    if (!this.canvasContainer || this.width <= 0 || this.height <= 0) return;
    const container = this.canvasContainer.nativeElement;

    // How many pixels of canvas fit in both axes
    const fitX = Math.floor(container.clientWidth / this.width);
    const fitY = Math.floor(container.clientHeight / this.height);

    const fit = Math.max(1, Math.min(fitX, fitY)); // Fitting zoom
    const initial = Math.max(1, Math.floor(fit * 0.9)); // start slightly zoomed out
    this.canvasZoomService.setPixelSize(initial);
  }
}
