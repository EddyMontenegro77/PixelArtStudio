import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import { StorageService } from './storage.service';

describe('AuthService', () => {
  let service: AuthService;

  const resetPasswordForEmailMock = vi.fn();
  const getSessionMock = vi.fn();
  const onAuthStateChangeMock = vi.fn();

  const supabaseServiceMock = {
    supabase: {
      auth: {
        getSession: getSessionMock,
        onAuthStateChange: onAuthStateChangeMock,
        resetPasswordForEmail: resetPasswordForEmailMock,
      },
      from: vi.fn(),
    },
  };

  const routerMock = {
    navigate: vi.fn(),
  };

  const storageServiceMock = {
    getAvatarUrl: vi.fn(),
    uploadAvatar: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getSessionMock.mockResolvedValue({ data: { session: null }, error: null });
    onAuthStateChangeMock.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: supabaseServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: StorageService, useValue: storageServiceMock },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call supabase resetPasswordForEmail', async () => {
    resetPasswordForEmailMock.mockResolvedValue({ error: null });

    await service.recoverPassword('user@example.com');

    expect(resetPasswordForEmailMock).toHaveBeenCalledTimes(1);
    expect(resetPasswordForEmailMock).toHaveBeenCalledWith('user@example.com');
  });

  it('should throw when recoverPassword gets an error from supabase', async () => {
    const fakeError = new Error('recover failed');
    resetPasswordForEmailMock.mockResolvedValue({ error: fakeError });

    let caughtError: unknown;
    try {
      await service.recoverPassword('user@example.com');
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBe(fakeError);
  });
});
