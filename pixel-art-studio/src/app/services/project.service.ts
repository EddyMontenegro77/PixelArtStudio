import { Injectable } from '@angular/core';
import { ProjectModel } from '../models/project.model';
import { HistoryManager } from '../models/history-manager.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private projectSubject = new BehaviorSubject<ProjectModel | null>(null);
  project$: Observable<ProjectModel | null> = this.projectSubject.asObservable();

  private historyManager!: HistoryManager;

  createNewProject(width: number, height: number, name: string): void {
    const project = new ProjectModel(width, height, name);
    this.historyManager = new HistoryManager();
    this.projectSubject.next(project);
  }

  getProject(): ProjectModel {
    const project = this.projectSubject.value;
    if (!project) throw new Error('Project not initialized');
    return project;
  }

  getHistoryManager() {
    return this.historyManager;
  }
}
