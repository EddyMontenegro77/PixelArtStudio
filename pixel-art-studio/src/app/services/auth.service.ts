import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../types/auth-interfaces/user';
import { LoginCredentials, SignUpData, SignUpResult } from '../types/auth-interfaces/auth';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { StorageService } from './storage.service';

type UserProfileRow = {
  username: string | null;
  avatar_url: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly MAX_AVATAR_SIZE_BYTES = 1_000_000;
  private readonly MAX_AVATAR_DIMENSION = 512;
  private authState$ = new BehaviorSubject<boolean>(false);
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private authInitialized: Promise<void>;
  private resolveAuthInitialized!: () => void;

  public isAuthenticated$ = this.authState$.asObservable();
  public user$ = this.currentUser$.asObservable();

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private ngZone: NgZone,
    private storageService: StorageService,
  ) {
    this.authInitialized = new Promise<void>((resolve) => {
      this.resolveAuthInitialized = resolve;
    });
    this.initializeAuth();
  }

  async signUp(signUpData: SignUpData): Promise<SignUpResult> {
    const data = await this.signUpWithAuth(signUpData);

    if (data.session) {
      await this.applySession(data.session, signUpData.username);
      return { requiresEmailConfirmation: false };
    }

    return { requiresEmailConfirmation: true };
  }

  async logIn(loginCredentials: LoginCredentials): Promise<void> {
    const { data, error } = await this.supabaseService.supabase.auth.signInWithPassword({
      email: loginCredentials.email,
      password: loginCredentials.password,
    });
    if (error) throw error;
    await this.applySession(data.session);
  }

  async recoverPassword(email: string): Promise<void> {
    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;

    const { error } = await this.supabaseService.supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.supabaseService.supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabaseService.supabase.auth.signOut();
    if (error) throw error;
    this.clearAuthState();
    await this.router.navigate(['/login']);
  }

  async updateUsername(username: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No active session.');

    const sanitized = username.trim();
    if (!sanitized) throw new Error('Username cannot be empty.');

    const { error } = await this.supabaseService.supabase.from('user_profile').upsert(
      {
        user_id: user.id,
        username: sanitized,
      },
      { onConflict: 'user_id' },
    );

    if (error) throw error;

    this.ngZone.run(() => {
      this.currentUser$.next({ ...user, name: sanitized });
    });
  }

  async uploadAvatar(file: File): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No active session.');

    const avatarBlob = await this.convertAvatarToWebp(file);

    const uploadResult = await this.storageService.uploadAvatar({
      userId: user.id,
      file: avatarBlob,
    });

    if (!uploadResult.success) {
      throw uploadResult.error;
    }

    const avatarPath = uploadResult.path;
    const { error } = await this.supabaseService.supabase.from('user_profile').upsert(
      {
        user_id: user.id,
        username: user.name,
        avatar_url: avatarPath,
      },
      { onConflict: 'user_id' },
    );

    if (error) throw error;

    const signedUrl = await this.storageService.getAvatarUrl(avatarPath);
    this.ngZone.run(() => {
      this.currentUser$.next({
        ...user,
        avatar_url: signedUrl ?? user.avatar_url,
      });
    });
  }

  private async convertAvatarToWebp(file: File): Promise<Blob> {
    const image = await this.loadImage(file);

    let width = image.width;
    let height = image.height;
    const maxDimension = Math.max(width, height);
    if (maxDimension > this.MAX_AVATAR_DIMENSION) {
      const ratio = this.MAX_AVATAR_DIMENSION / maxDimension;
      width = Math.max(1, Math.floor(width * ratio));
      height = Math.max(1, Math.floor(height * ratio));
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not prepare avatar canvas.');
    }

    const qualitySteps = [0.92, 0.86, 0.8, 0.74, 0.68, 0.62, 0.56, 0.5];
    let candidateBlob: Blob | null = null;

    for (let attempts = 0; attempts < 4; attempts++) {
      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      for (const quality of qualitySteps) {
        const blob = await this.canvasToBlob(canvas, 'image/webp', quality);
        if (!blob) continue;
        candidateBlob = blob;
        if (blob.size <= this.MAX_AVATAR_SIZE_BYTES) {
          return blob;
        }
      }

      width = Math.max(1, Math.floor(width * 0.8));
      height = Math.max(1, Math.floor(height * 0.8));
    }

    if (candidateBlob && candidateBlob.size <= this.MAX_AVATAR_SIZE_BYTES) {
      return candidateBlob;
    }

    throw new Error('Could not compress avatar below 1MB.');
  }

  private async loadImage(file: File): Promise<HTMLImageElement> {
    const dataUrl = await this.readFileAsDataUrl(file);
    const image = new Image();
    image.src = dataUrl;
    await image.decode();
    return image;
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Could not read avatar file.'));
      reader.readAsDataURL(file);
    });
  }

  private canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality: number,
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), type, quality);
    });
  }

  isAuthenticated(): boolean {
    return this.authState$.value;
  }

  getCurrentUser(): User | null {
    return this.currentUser$.value;
  }

  async hasActiveSession(): Promise<boolean> {
    const {
      data: { session },
      error,
    } = await this.supabaseService.supabase.auth.getSession();

    if (error || !session) {
      this.clearAuthState();
      return false;
    }

    await this.applySession(session);
    return true;
  }

  waitForAuthInitialization(): Promise<void> {
    return this.authInitialized;
  }

  private initializeAuth(): void {
    void this.restoreSession().finally(() => {
      this.resolveAuthInitialized();
    });
    this.supabaseService.supabase.auth.onAuthStateChange((_event, session) => {
      void this.ngZone.run(() => this.applySession(session));
    });
  }

  private async restoreSession(): Promise<void> {
    const {
      data: { session },
      error,
    } = await this.supabaseService.supabase.auth.getSession();
    if (error) {
      this.authState$.next(false);
      this.currentUser$.next(null);
      return;
    }
    await this.applySession(session);
  }

  private async applySession(session: Session | null, preferredUsername?: string): Promise<void> {
    if (!session?.user) {
      this.clearAuthState();
      return;
    }

    const authUser = session.user;
    const existingProfile = await this.fetchUserProfile(authUser.id);
    const profile = await this.ensureUserProfile(authUser, existingProfile, preferredUsername);
    const avatarUrl = await this.resolveAvatarUrl(profile?.avatar_url ?? null);
    const user = this.mapToAppUser(authUser, profile, avatarUrl);

    this.ngZone.run(() => {
      this.currentUser$.next(user);
      this.authState$.next(true);
    });
  }

  private clearAuthState(): void {
    this.ngZone.run(() => {
      this.authState$.next(false);
      this.currentUser$.next(null);
    });
  }

  private async fetchUserProfile(userId: string): Promise<UserProfileRow | null> {
    const { data, error } = await this.supabaseService.supabase
      .from('user_profile')
      .select('username, avatar_url')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return null;

    return data as UserProfileRow | null;
  }

  private async resolveAvatarUrl(avatarPath: string | null): Promise<string> {
    if (!avatarPath) return '';

    const signedUrl = await this.storageService.getAvatarUrl(avatarPath);
    return signedUrl ?? '';
  }

  private async signUpWithAuth(signUpData: SignUpData) {
    const { data, error } = await this.supabaseService.supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        data: { username: signUpData.username },
      },
    });

    if (error) throw error;
    return data;
  }

  private async ensureUserProfile(
    authUser: SupabaseAuthUser,
    currentProfile: UserProfileRow | null,
    preferredUsername?: string,
  ): Promise<UserProfileRow | null> {
    if (currentProfile?.username) {
      return currentProfile;
    }

    const metadataUsername = this.readMetadataUsername(authUser);
    const fallbackName = authUser.email?.split('@')[0] ?? 'user';
    const username = (preferredUsername ?? metadataUsername ?? fallbackName).trim();

    const { error } = await this.supabaseService.supabase.from('user_profile').upsert(
      {
        user_id: authUser.id,
        username,
        avatar_url: currentProfile?.avatar_url ?? null,
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      return {
        username,
        avatar_url: currentProfile?.avatar_url ?? null,
      };
    }

    return {
      username,
      avatar_url: currentProfile?.avatar_url ?? null,
    };
  }

  private readMetadataUsername(authUser: SupabaseAuthUser): string | null {
    const metadata = authUser.user_metadata as { username?: unknown } | null;
    const value = metadata?.username;
    return typeof value === 'string' && value.trim() ? value : null;
  }

  private mapToAppUser(
    authUser: SupabaseAuthUser,
    profile: UserProfileRow | null,
    avatarUrl: string,
  ): User {
    return {
      id: authUser.id,
      email: authUser.email ?? '',
      name: profile?.username ?? authUser.email ?? '',
      avatar_url: avatarUrl,
    };
  }
}
