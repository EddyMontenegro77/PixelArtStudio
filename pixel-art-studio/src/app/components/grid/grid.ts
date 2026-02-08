import { Component } from '@angular/core';
import Action from '../../types/Action';
import HistoryManager from '../../models/HistoryManager.model';
import { GridModel } from '../../models/Grid.model';

@Component({
  selector: 'app-grid',
  imports: [],
  templateUrl: './grid.html',
  styleUrl: './grid.scss',
})
export class Grid {
  // Grid Attributes
  private width: number = 16;
  private height: number = 16;
  private pixelSize: number = 20;
  private selectedColor: string = '#FF0000FF';
  grid: GridModel = new GridModel(this.width, this.height);

  // Event Attributes
  private isPointerDown: boolean = false;

  constructor() {}

  zoomIn(): void {
    this.pixelSize += 5;
  }

  zoomOut(): void {
    this.pixelSize = this.pixelSize > 5 ? this.pixelSize - 5 : 5;
  }

  // Event Handlers

  onWheel(event: WheelEvent): void {
    if (event.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  onPixelClick(event: MouseEvent, row: number, column: number): void {
    this.grid.setPixelColor(row, column, this.selectedColor);
  }

  onPointerDown(event: PointerEvent): void {
    this.isPointerDown = true;
  }

  onPointerUp(event: PointerEvent): void {
    this.isPointerDown = false;
  }

  onPointerOver(event: PointerEvent, row: number, column: number): void {
    if (this.isPointerDown) {
      this.grid.setPixelColor(row, column, this.selectedColor);
    }
  }

  // Getters and Setters

  getPixelSize(): number {
    return this.pixelSize;
  }

  setPixelSize(size: number): void {
    this.pixelSize = size;
  }

  getSelectedColor(): string {
    return this.selectedColor;
  }

  setSelectedColor(color: string): void {
    this.selectedColor = color;
  }
}
