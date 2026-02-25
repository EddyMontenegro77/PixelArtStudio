import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { LocalProjectService } from './local-project.service';
import { PersistedProjectSaveData } from '../types/projectsave/project-save';

describe('LocalProjectService', () => {
  let service: LocalProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalProjectService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const projectDraftLocalStorageKey = 'pixel_art_studio_local_draft_project';

  const fakeDraft = {
    name: 'Test',
    width: 16,
    height: 16,
    pixelSize: 1,
    activeFrameId: 1,
    palette: { name: 'Default', colors: ['#000000'] },
    frames: [],
  } as PersistedProjectSaveData;

  it('should save draft in localStorage', () => {
    // Arrange
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    // Act
    service.saveDraft(fakeDraft);

    // Assert
    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(setItemSpy).toHaveBeenCalledWith(projectDraftLocalStorageKey, JSON.stringify(fakeDraft));
  });

  it('should load draft when JSON is valid', () => {
    // Arrange
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockReturnValue(JSON.stringify(fakeDraft));

    //Act
    const result = service.loadDraft();

    // Assert
    expect(getItemSpy).toHaveBeenCalledWith(projectDraftLocalStorageKey);
    expect(result).toEqual(fakeDraft);
  });

  it('should return null when JSON is invalid', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('{invalid-json');

    const result = service.loadDraft();

    expect(result).toBeNull();
  });

  it('should clear draft in localStorage', () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    service.clearDraft();

    expect(removeItemSpy).toHaveBeenCalledTimes(1);
    expect(removeItemSpy).toHaveBeenCalledWith(projectDraftLocalStorageKey);
  });

  it('should return true when localStorage has a draft', () => {
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockReturnValue(JSON.stringify(fakeDraft));

    const result = service.hasDraft();

    expect(getItemSpy).toHaveBeenCalledOnce();
    expect(getItemSpy).toHaveBeenCalledWith(projectDraftLocalStorageKey);
    expect(result).toBe(true);
  });

  it('should return false when localStorage has no draft', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    const result = service.hasDraft();

    expect(getItemSpy).toHaveBeenCalledOnce();
    expect(getItemSpy).toHaveBeenCalledWith(projectDraftLocalStorageKey);
    expect(result).toBe(false);
  });
});
