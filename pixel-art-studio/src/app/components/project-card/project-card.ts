import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-project-card',
  imports: [],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  projectName = input.required<string>();
  projectUuid = input.required<string>();
  thumbnail = input<string | null>('/assets/placeholder_image.webp');

  open = output<string>();
  deleteRequested = output<string>();

  handleOpenProject(): void {
    this.open.emit(this.projectUuid());
  }

  handleDeleteProject(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteRequested.emit(this.projectUuid());
  }
}
