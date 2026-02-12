import { Component } from '@angular/core';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-layers',
  imports: [],
  templateUrl: './layers.html',
  styleUrl: './layers.scss',
})
export class Layers {
  constructor(private projectService: ProjectService) {}

  addLayer(): void {}

  removeLayer(): void {}
}
