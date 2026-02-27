import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ProjectService } from './project.service';
import { ProjectRepositoryService } from './project-repository.service';
import { AuthService } from './auth.service';
import { LocalProjectService } from './local-project.service';
import { PersistedProjectSaveData } from '../types/projectsave/project-save';

describe('ProjectService', () => {
  let service: ProjectService;
  const projectRepositoryServiceMock = {
    saveProjectInCloud: vi.fn(),
  };
  const authServiceMock = {
    isAuthenticated: vi.fn(),
  };
  const localProjectServiceMock = {
    saveDraft: vi.fn(),
    loadDraft: vi.fn(),
    clearDraft: vi.fn(),
    hasDraft: vi.fn(),
  };

  const fakeDraft: PersistedProjectSaveData = {
    name: 'Draft',
    width: 16,
    height: 16,
    pixelSize: 1,
    activeFrameId: 1,
    palette: { name: 'Default', colors: ['#000000'] },
    frames: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ProjectService,
        { provide: ProjectRepositoryService, useValue: projectRepositoryServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: LocalProjectService, useValue: localProjectServiceMock },
      ],
    });
    service = TestBed.inject(ProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save locally when user is not authenticated', async () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    const saveLocalSpy = vi
      .spyOn(service, 'saveProjectToLocalDraft')
      .mockImplementation(() => undefined);

    const result = await service.saveProject();

    expect(saveLocalSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ target: 'local' });
  });

  it('should save in cloud when user is authenticated', async () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    vi.spyOn(service, 'saveProjectToCloud').mockResolvedValue('project-123');

    const result = await service.saveProject();

    expect(service.saveProjectToCloud).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ target: 'cloud', projectId: 'project-123' });
  });

  it('should migrate local draft to cloud for current user', async () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    localProjectServiceMock.loadDraft.mockReturnValue(fakeDraft);
    projectRepositoryServiceMock.saveProjectInCloud.mockResolvedValue('project-123');

    const result = await service.migrateLocalDraftToCloudForCurrentUser();

    expect(projectRepositoryServiceMock.saveProjectInCloud).toHaveBeenCalledWith(fakeDraft);
    expect(localProjectServiceMock.clearDraft).toHaveBeenCalledTimes(1);
    expect(result).toBe('project-123');
  });

  it('should not migrate draft when user is not authenticated', async () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);

    const result = await service.migrateLocalDraftToCloudForCurrentUser();

    expect(localProjectServiceMock.loadDraft).not.toHaveBeenCalled();
    expect(projectRepositoryServiceMock.saveProjectInCloud).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
