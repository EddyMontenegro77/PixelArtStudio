import { Component, input, output } from '@angular/core';
import { ThemeService } from '../../../../services/theme.service';

@Component({
  selector: 'app-layer',
  standalone: true,
  imports: [],
  templateUrl: './layer.html',
  styleUrl: './layer.scss',
})
export class Layer {
  layerName = input.required<string>();
  layerId = input.required<number>();
  isLayerVisible = input<boolean>(true);
  isActive = input<boolean>(false);
  isEditingName = false;
  nameDraft = '';

  select = output<number>();
  toggleVisibility = output<number>();
  moveUp = output<number>();
  moveDown = output<number>();
  remove = output<number>();
  rename = output<{ layerId: number; name: string }>();

  constructor(private themeService: ThemeService) {}

  selectLayer(): void {
    if (this.isEditingName) return;
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

  beginRename(event: MouseEvent): void {
    event.stopPropagation();
    this.isEditingName = true;
    this.nameDraft = this.layerName();
  }

  commitRename(event?: Event): void {
    event?.stopPropagation();
    const trimmedName = this.nameDraft.trim();
    if (trimmedName.length > 0 && trimmedName !== this.layerName()) {
      this.rename.emit({ layerId: this.layerId(), name: trimmedName });
    }
    this.isEditingName = false;
  }

  cancelRename(event?: Event): void {
    event?.stopPropagation();
    this.nameDraft = this.layerName();
    this.isEditingName = false;
  }

  onRenameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.commitRename(event);
      return;
    }

    if (event.key === 'Escape') {
      this.cancelRename(event);
    }
  }

  getIconPath(name: 'visible' | 'not_visible' | 'arrow_up' | 'arrow_down' | 'minus'): string {
    const suffix = this.themeService.getTheme() === 'dark' ? 'white' : 'black';
    return `/icons/${name}_${suffix}.svg`;
  }
}
