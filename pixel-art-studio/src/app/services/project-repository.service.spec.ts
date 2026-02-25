import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ProjectRepositoryService } from './project-repository.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { SupabaseService } from './supabase.service';
import { ProjectModel } from '../models/project.model';
import { PersistedProjectSaveData } from '../types/projectsave/project-save';

describe('ProjectRepositoryService', () => {
  let service: ProjectRepositoryService;

  const authServiceMock = {
    getCurrentUser: vi.fn(),
  };

  const storageServiceMock = {
    uploadProjectThumbnail: vi.fn(),
    removeObject: vi.fn(),
    getSignedUrl: vi.fn(),
  };

  const insertSingleMock = vi.fn();
  const insertSelectMock = vi.fn(() => ({ single: insertSingleMock }));
  const insertMock = vi.fn(() => ({ select: insertSelectMock }));

  const supabaseMock = {
    from: vi.fn(() => ({
      insert: insertMock,
    })),
  };

  const supabaseServiceMock = {
    supabase: supabaseMock,
  };

  const USER_PROJECT_TABLE = 'user_project';

  const projectData = {
    name: 'My Project',
    width: 16,
    height: 16,
    pixelSize: 1,
    activeFrameId: 1,
    palette: { name: 'Default', colors: ['#000000'] },
    frames: [],
  } as PersistedProjectSaveData;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ProjectRepositoryService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: SupabaseService, useValue: supabaseServiceMock },
      ],
    });

    service = TestBed.inject(ProjectRepositoryService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should insert project with user_id and return project_id', async () => {
    authServiceMock.getCurrentUser.mockReturnValue({ id: 'user-1' });

    insertSingleMock.mockReturnValue({
      data: { project_id: 'proj-123' },
      error: null,
    });

    const result = await service.insertProjectInCloud(projectData);

    expect(supabaseMock.from).toHaveBeenCalledWith(USER_PROJECT_TABLE);
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'user-1',
      project_name: 'My Project',
      width: 16,
      height: 16,
      active_frame_id: 1,
      project_data: projectData,
    });
    expect(result).toBe('proj-123');
  });

  it('should throw error when trying to insert project in cloud', async () => {
    authServiceMock.getCurrentUser.mockResolvedValue({ id: 'user-1' });

    const fakeError = new Error('insert failed');
    insertSingleMock.mockResolvedValue({
      data: null,
      error: fakeError,
    });

    let caughtError = undefined;

    try {
      await service.insertProjectInCloud(projectData);
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).toBe(fakeError);
  });
});
