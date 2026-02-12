import { Injectable } from '@angular/core';
import { ProjectModel } from '../models/project.model';
import { HistoryManager } from '../models/history-manager.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { FrameModel, FrameSnapshot } from '../models/frame.model';
import { LayerModel } from '../models/layer.model';
import Action from '../types/action';
import { ProjectSnapshot } from '../models/project.model';

type ProjectState = {
  projectSnapshot: ProjectSnapshot;
  frameSnapshots: Map<number, FrameSnapshot>;
};

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

  getHistoryManager(): HistoryManager {
    return this.historyManager;
  }

  addFrame(): void {
    const project = this.getProject();
    this.executeStructuralAction('ADD_FRAME', () => project.addFrame());
  }

  removeFrame(frameId: number): void {
    const project = this.getProject();
    this.executeStructuralAction('REMOVE_FRAME', () => project.removeFrame(frameId));
  }

  addLayerToActiveFrame(): void {
    const activeFrame = this.getActiveFrame();
    this.executeStructuralAction('ADD_LAYER', () => activeFrame.addLayer());
  }

  removeLayerFromActiveFrame(layerId: number): void {
    const activeFrame = this.getActiveFrame();
    this.executeStructuralAction('REMOVE_LAYER', () => activeFrame.removeLayer(layerId));
  }

  moveLayerUpInActiveFrame(layerId: number): void {
    const activeFrame = this.getActiveFrame();
    this.executeStructuralAction('MOVE_LAYER_UP', () => activeFrame.moveLayerUp(layerId));
  }

  moveLayerDownInActiveFrame(layerId: number): void {
    const activeFrame = this.getActiveFrame();
    this.executeStructuralAction('MOVE_LAYER_DOWN', () => activeFrame.moveLayerDown(layerId));
  }

  toggleLayerVisibilityInActiveFrame(layerId: number): void {
    const activeFrame = this.getActiveFrame();
    this.executeStructuralAction('TOGGLE_LAYER_VISIBILITY', () =>
      activeFrame.toggleLayerVisibility(layerId),
    );
  }

  getActiveFrame(): FrameModel {
    const project = this.getProject();
    return project.getActiveFrame();
  }

  setActiveFrame(frameId: number): void {
    const project = this.getProject();
    project.setActiveFrameId(frameId);
    this.emitProjectUpdate();
  }

  getActiveLayer(): LayerModel {
    const activeFrame = this.getActiveFrame();
    return activeFrame.getActiveLayer();
  }

  setActiveLayer(layerId: number): void {
    const activeFrame = this.getActiveFrame();
    activeFrame.setActiveLayer(layerId);
    this.emitProjectUpdate();
  }

  private emitProjectUpdate(): void {
    this.projectSubject.next(this.getProject());
  }

  private executeStructuralAction(type: string, mutation: () => void): void {
    const project = this.getProject();
    const before = this.captureState(project);

    mutation();

    const after = this.captureState(project);
    const action: Action = {
      type,
      undo: () => {
        this.restoreState(project, before);
        this.emitProjectUpdate();
      },
      redo: () => {
        this.restoreState(project, after);
        this.emitProjectUpdate();
      },
    };

    this.historyManager.execute(action);
    this.emitProjectUpdate();
  }

  private captureState(project: ProjectModel): ProjectState {
    const projectSnapshot = project.createSnapshot();
    const frameSnapshots = new Map<number, FrameSnapshot>();

    for (const frame of projectSnapshot.frames) {
      frameSnapshots.set(frame.getId(), frame.createSnapshot());
    }

    return { projectSnapshot, frameSnapshots };
  }

  private restoreState(project: ProjectModel, state: ProjectState): void {
    project.restoreSnapshot(state.projectSnapshot);

    for (const frame of state.projectSnapshot.frames) {
      const frameSnapshot = state.frameSnapshots.get(frame.getId());
      if (frameSnapshot) {
        frame.restoreSnapshot(frameSnapshot);
      }
    }
  }
}
