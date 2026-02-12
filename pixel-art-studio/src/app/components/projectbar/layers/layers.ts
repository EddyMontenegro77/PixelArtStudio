import { Component } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { LayerModel } from '../../../models/layer.model';
import { Layer } from './layer/layer';

@Component({
  selector: 'app-layers',
  imports: [Layer],
  templateUrl: './layers.html',
  styleUrl: './layers.scss',
})
export class Layers {
  layers: LayerModel[] = [];
  activeLayerId!: number;

  constructor(private projectService: ProjectService) {
    this.projectService.project$.subscribe((project) => {
      if (!project) return;
      const frame = project.getActiveFrame();
      this.layers = frame.getLayers();
      this.activeLayerId = frame.getActiveLayer().getId();
    });
  }

  addLayer(): void {
    this.projectService.addLayerToActiveFrame();
  }

  removeLayer(layerId: number): void {
    this.projectService.removeLayerFromActiveFrame(layerId);
  }

  selectLayer(layerId: number): void {
    this.projectService.setActiveLayer(layerId);
  }

  moveLayerUp(layerId: number): void {
    this.projectService.moveLayerUpInActiveFrame(layerId);
  }

  moveLayerDown(layerId: number): void {
    this.projectService.moveLayerDownInActiveFrame(layerId);
  }

  toggleVisibility(layerId: number): void {
    this.projectService.toggleLayerVisibilityInActiveFrame(layerId);
  }
}
