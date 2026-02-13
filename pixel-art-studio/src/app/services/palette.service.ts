import { Injectable } from '@angular/core';
import { ProjectService } from './project.service';
import { PaletteModel } from '../models/palette.model';

@Injectable({
  providedIn: 'root',
})
export class PaletteService {
  constructor(private projectService: ProjectService) {}

  private getActivePalette(): PaletteModel {
    return this.projectService.getActivePalette();
  }

  updateActivePalette(palette: PaletteModel): void {
    this.projectService.updateActivePalette(palette);
  }

  getColors(): string[] {
    const project = this.getActivePalette();
    return project.getColors();
  }

  addColor(color: string): void {
    const palette = this.getActivePalette();
    palette.addColor(color);
    this.updateActivePalette(palette);
  }

  removeColor(colorIndex: number): void {
    const palette = this.getActivePalette();
    palette.removeColor(colorIndex);
    this.updateActivePalette(palette);
  }

  updateColor(colorIndex: number, newColor: string): void {
    const palette = this.getActivePalette();
    palette.updateColor(colorIndex, newColor);
    this.updateActivePalette(palette);
  }

  getPaletteName(): string {
    const palette = this.getActivePalette();
    return palette.getPaletteName();
  }

  setPaletteName(newName: string): void {
    const palette = this.getActivePalette();
    palette.setPaletteName(newName);
    this.updateActivePalette(palette);
  }
}
