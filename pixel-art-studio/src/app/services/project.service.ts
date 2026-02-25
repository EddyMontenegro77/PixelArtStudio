import { Injectable, NgZone, signal } from '@angular/core';
import { ProjectModel } from '../models/project.model';
import { HistoryManager } from '../models/history-manager.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { FrameModel, FrameSnapshot } from '../models/frame.model';
import { LayerModel } from '../models/layer.model';
import Action from '../types/Action';
import { PaletteModel } from '../models/palette.model';
import { GridModel } from '../models/Grid.model';
import { PersistedProjectSaveData, ProjectState } from '../types/projectsave/project-save';
import { ProjectListItem, ProjectRepositoryService } from './project-repository.service';
import { renderVisibleLayers } from '../components/canvas/canvas-render.utils';
import { AuthService } from './auth.service';
import { LocalProjectService } from './local-project.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private projectSubject = new BehaviorSubject<ProjectModel | null>(null);
  project$: Observable<ProjectModel | null> = this.projectSubject.asObservable();
  readonly lastSavedAt = signal<string | null>(null);

  private historyManager!: HistoryManager;

  constructor(
    private projectRepositoryService: ProjectRepositoryService,
    private authService: AuthService,
    private localProjectService: LocalProjectService,
    private ngZone: NgZone,
  ) {}

  createNewProject(width: number, height: number, name: string): void {
    const project = new ProjectModel(width, height, name);
    this.historyManager = new HistoryManager();
    this.projectSubject.next(project);
  }

  resetProjectState(): void {
    this.historyManager = new HistoryManager();
    this.projectSubject.next(null);
  }

  async saveProjectToCloud(): Promise<string> {
    const project = this.getProject();
    const projectData = this.toProjectSaveData(project);
    const thumbnailBlob = await this.generateThumbnailBlob();
    const projectUuid = await this.projectRepositoryService.saveProjectInCloud(
      projectData,
      project.cloudProjectId,
      thumbnailBlob,
    );

    project.cloudProjectId = projectUuid;
    this.localProjectService.clearDraft();
    this.emitProjectUpdate();
    return projectUuid;
  }

  async saveProject(): Promise<{ target: 'cloud' | 'local'; projectId?: string }> {
    if (this.authService.isAuthenticated()) {
      const projectId = await this.saveProjectToCloud();
      this.setLastSavedNow();
      return { target: 'cloud', projectId };
    }

    this.saveProjectToLocalDraft();
    this.setLastSavedNow();
    return { target: 'local' };
  }

  async migrateLocalDraftToCloudForCurrentUser(): Promise<string | null> {
    if (!this.authService.isAuthenticated()) {
      return null;
    }

    const draft = this.localProjectService.loadDraft();
    if (!draft) {
      return null;
    }

    const projectId = await this.projectRepositoryService.saveProjectInCloud(draft);
    this.localProjectService.clearDraft();
    return projectId;
  }

  saveProjectToLocalDraft(): void {
    const project = this.getProject();
    const projectData = this.toProjectSaveData(project);
    this.localProjectService.saveDraft(projectData);
  }

  loadProjectFromLocalDraft(): boolean {
    const draft = this.localProjectService.loadDraft();
    if (!draft) return false;

    this.replaceProjectFromPersisted(draft);
    return true;
  }

  hasLocalDraft(): boolean {
    return this.localProjectService.hasDraft();
  }

  clearLocalDraft(): void {
    this.localProjectService.clearDraft();
  }

  async loadProjectFromCloud(projectId?: string): Promise<void> {
    const targetProjectId = projectId ?? this.projectSubject.value?.cloudProjectId;
    if (!targetProjectId) return;

    const projectSaveData = await this.projectRepositoryService.getProjectFromCloud(targetProjectId);
    this.replaceProjectFromPersisted(projectSaveData, targetProjectId);
  }

  async listCloudProjectsWithThumbnails(): Promise<Array<ProjectListItem & { thumbnailUrl: string | null }>> {
    const projects = await this.projectRepositoryService.listProjectsFromCloud();

    return Promise.all(
      projects.map(async (project) => {
        if (!project.thumbnailPath) {
          return { ...project, thumbnailUrl: null };
        }

        const thumbnailUrl = await this.projectRepositoryService.getThumbnailUrl(project.thumbnailPath);
        return { ...project, thumbnailUrl };
      }),
    );
  }

  async deleteProjectFromCloud(projectId: string): Promise<void> {
    await this.projectRepositoryService.deleteProjectFromCloud(projectId);
  }

  toProjectSaveData(project: ProjectModel = this.getProject()): PersistedProjectSaveData {
    return {
      name: project.name,
      width: project.width,
      height: project.height,
      pixelSize: project.pixelSize,
      activeFrameId: project.getActiveFrameId(),
      palette: project.getPalette().createSnapshot(),
      frames: project.frames.map((frame) => ({
        id: frame.getId(),
        duration: frame.getDuration(),
        activeLayerId: frame.getActiveLayer().getId(),
        layers: frame.getLayers().map((layer) => ({
          id: layer.getId(),
          name: layer.getName(),
          visible: layer.isVisible(),
          opacity: layer.getOpacity(),
          locked: layer.isLocked(),
          pixels: layer.getGrid().getPixels(),
        })),
      })),
    };
  }

  fromProjectSaveData(raw: PersistedProjectSaveData): ProjectModel {
    const project = new ProjectModel(raw.width, raw.height, raw.name);
    project.pixelSize = raw.pixelSize;

    const palette = new PaletteModel(raw.palette.name);
    palette.restoreSnapshot(raw.palette);
    project.setPalette(palette);

    const frames: FrameModel[] = raw.frames.map((rawFrame) => {
      const frame = new FrameModel(raw.width, raw.height);
      (frame as any).frameId = rawFrame.id;
      frame.setDuration(rawFrame.duration);

      const layers: LayerModel[] = rawFrame.layers.map((rawLayer) => {
        const layer = new LayerModel(raw.width, raw.height, rawLayer.name);
        (layer as any).layerId = rawLayer.id;
        layer.setVisible(rawLayer.visible);
        layer.setOpacity(rawLayer.opacity);
        layer.setLocked(rawLayer.locked);

        const grid = new GridModel(raw.width, raw.height);
        grid.setPixels(rawLayer.pixels);
        layer.setGrid(grid);
        return layer;
      });

      (frame as any).layers = layers;
      frame.setActiveLayer(rawFrame.activeLayerId);
      return frame;
    });

    (project as any).frames = frames;
    project.setActiveFrameId(raw.activeFrameId);

    const maxFrameId = raw.frames.reduce((max, frame) => Math.max(max, frame.id), 0);
    const maxLayerId = raw.frames.reduce((maxFrame, frame) => {
      const maxLayer = frame.layers.reduce((max, layer) => Math.max(max, layer.id), 0);
      return Math.max(maxFrame, maxLayer);
    }, 0);

    (FrameModel as any).frameCounter = maxFrameId + 1;
    (LayerModel as any).layerCounter = maxLayerId + 1;

    return project;
  }

  replaceProjectFromPersisted(raw: PersistedProjectSaveData, cloudProjectId?: string): void {
    const project = this.fromProjectSaveData(raw);
    project.cloudProjectId = cloudProjectId;
    this.historyManager = new HistoryManager();
    this.projectSubject.next(project);
  }

  serializeProject(project: ProjectModel = this.getProject()): string {
    return JSON.stringify(this.toProjectSaveData(project));
  }

  deserializeAndReplace(serializedProject: string): void {
    const parsed = JSON.parse(serializedProject) as PersistedProjectSaveData;
    this.replaceProjectFromPersisted(parsed);
  }

  getProject(): ProjectModel {
    const project = this.projectSubject.value;
    if (!project) throw new Error('Project not initialized');
    return project;
  }

  hasProject(): boolean {
    return this.projectSubject.value !== null;
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

  renameLayerInActiveFrame(layerId: number, name: string): void {
    const activeFrame = this.getActiveFrame();
    this.executeStructuralAction('RENAME_LAYER', () => {
      const layer = activeFrame.getLayers().find((currentLayer) => currentLayer.getId() === layerId);
      if (!layer) {
        throw new Error(`Layer ${layerId} not found in active frame`);
      }
      layer.setName(name);
    });
  }

  getActiveFrame(): FrameModel {
    const project = this.getProject();
    return project.getActiveFrame();
  }

  getFrames(): FrameModel[] {
    return [...this.getProject().frames];
  }

  getActiveFrameId(): number {
    return this.getProject().getActiveFrameId();
  }

  setActiveFrame(frameId: number): void {
    const project = this.getProject();
    project.setActiveFrameId(frameId);
    this.emitProjectUpdate();
  }

  setFrameDuration(frameId: number, ms: number): void {
    const project = this.getProject();
    const duration = this.normalizeFrameDuration(ms);
    this.executeStructuralAction('SET_FRAME_DURATION', () => {
      const frame = project.frames.find((currentFrame) => currentFrame.getId() === frameId);
      if (!frame) {
        throw new Error(`Frame ${frameId} not found in project`);
      }
      frame.setDuration(duration);
    });
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

  getActivePalette(): PaletteModel {
    const project = this.getProject();
    return project.getPalette();
  }

  updateActivePalette(newPalette: PaletteModel): void {
    const project = this.getProject();
    project.setPalette(newPalette);
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

  private normalizeFrameDuration(ms: number): number {
    if (!Number.isFinite(ms)) return 100;
    return Math.max(20, Math.min(10000, Math.floor(ms)));
  }

  private async generateThumbnailBlob(): Promise<Blob> {
    const project = this.getProject();
    const activeFrame = project.getActiveFrame();
    const thumbnailScale = 4;

    const canvas = document.createElement('canvas');
    canvas.width = activeFrame.getWidth() * thumbnailScale;
    canvas.height = activeFrame.getHeight() * thumbnailScale;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not create thumbnail context.');
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    renderVisibleLayers(context, activeFrame, thumbnailScale);

    const blob = await this.canvasToBlob(canvas, 'image/webp', 0.85);
    if (!blob) {
      throw new Error('Could not generate project thumbnail.');
    }

    return blob;
  }

  private canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality?: number,
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), type, quality);
    });
  }

  private formatCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private setLastSavedNow(): void {
    const time = this.formatCurrentTime();
    this.ngZone.run(() => {
      this.lastSavedAt.set(time);
    });
  }
}
