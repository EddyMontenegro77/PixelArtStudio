import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-color-cell',
  imports: [],
  templateUrl: './color-cell.html',
  styleUrl: './color-cell.scss',
})
export class ColorCell {
  color = input.required<string>();
  index = input.required<number>();
  isSelected = input.required<boolean>();

  select = output<string>();
  remove = output<number>();

  onSelect(): void {
    this.select.emit(this.color());
  }

  onRemove(): void {
    this.remove.emit(this.index());
  }
}
