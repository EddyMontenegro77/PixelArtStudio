import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-layer',
  imports: [],
  templateUrl: './layer.html',
  styleUrl: './layer.scss',
})
export class Layer {
  layerName = input.required<string>();
  layerId = input.required<number>();
  isLayerVisible = input<boolean>(true);
  isActive = input<boolean>(false);

  select = output<number>();
  toggleVisibility = output<number>();
  moveUp = output<number>();
  moveDown = output<number>();
  remove = output<number>();

  selectLayer(): void {
    this.select.emit(this.layerId());
  }

  handleToggleVisibility(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleVisibility.emit(this.layerId());
  }

  handleMoveLayerUp(event: MouseEvent): void {
    event.stopPropagation();
    this.moveUp.emit(this.layerId());
  }

  handleMoveLayerDown(event: MouseEvent): void {
    event.stopPropagation();
    this.moveDown.emit(this.layerId());
  }

  removeLayer(event: MouseEvent): void {
    event.stopPropagation();
    this.remove.emit(this.layerId());
  }
}
