import { Injectable } from '@angular/core';
import { PersistedProjectSaveData } from '../types/projectsave/project-save';

@Injectable({
  providedIn: 'root',
})
export class LocalProjectService {
  private readonly LOCAL_DRAFT_KEY = 'pixel_art_studio_local_draft_project';

  saveDraft(projectData: PersistedProjectSaveData): void {
    localStorage.setItem(this.LOCAL_DRAFT_KEY, JSON.stringify(projectData));
  }

  loadDraft(): PersistedProjectSaveData | null {
    const raw = localStorage.getItem(this.LOCAL_DRAFT_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as PersistedProjectSaveData;
    } catch {
      return null;
    }
  }

  hasDraft(): boolean {
    return !!localStorage.getItem(this.LOCAL_DRAFT_KEY);
  }

  clearDraft(): void {
    localStorage.removeItem(this.LOCAL_DRAFT_KEY);
  }
}
