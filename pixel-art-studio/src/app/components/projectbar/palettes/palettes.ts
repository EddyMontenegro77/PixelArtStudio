import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaletteService } from '../../../services/palette.service';
import { ColorCell } from './color-cell/color-cell';
import { ToolManagerService } from '../../../services/tool-manager.service';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-palettes',
  imports: [FormsModule, ColorCell],
  templateUrl: './palettes.html',
  styleUrl: './palettes.scss',
})
export class Palettes {
  colors: string[] = [];
  paletteName: string = '';
  selectedColor: string = '#000000';

  constructor(
    private paletteService: PaletteService,
    private toolManagerService: ToolManagerService,
    private projectService: ProjectService,
  ) {
    this.projectService.project$.subscribe((project) => {
      if (!project) return;
      this.refreshPaletteState();
    });
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.toolManagerService.setFillColor(color);
  }

  addSelectedColor(): void {
    const colorToAdd = this.selectedColor;
    this.paletteService.addColor(colorToAdd);
    this.selectedColor = colorToAdd;
    this.toolManagerService.setFillColor(colorToAdd);
  }

  removeColor(index: number): void {
    this.paletteService.removeColor(index);
  }

  updatePaletteName(): void {
    this.paletteService.setPaletteName(this.paletteName);
  }

  private refreshPaletteState(): void {
    this.colors = this.paletteService.getColors();
    this.paletteName = this.paletteService.getPaletteName();
    if (!this.colors.includes(this.selectedColor) && this.colors.length > 0) {
      this.selectedColor = this.colors[0];
      this.toolManagerService.setFillColor(this.selectedColor);
    }
  }
}
