import { Component, input } from '@angular/core';

@Component({
  selector: 'app-layer',
  imports: [],
  templateUrl: './layer.html',
  styleUrl: './layer.scss',
})
export class Layer {
  layerName = input.required<string>();

  toggleVisibility(): void {}

  moveLayerUp(): void {}

  moveLayerDown(): void {}
}
