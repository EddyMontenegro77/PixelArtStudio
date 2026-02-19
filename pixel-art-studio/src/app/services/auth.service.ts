import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../types/auth-interfaces/user';
import { LoginCredentials, SignUpData, SignUpResult } from '../types/auth-interfaces/auth';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';

type UserProfileRow = {
  username: string | null;
  avatar_url: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
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
  ) {
    this.authInitialized = new Promise<void>((resolve) => {
      this.resolveAuthInitialized = resolve;
    });
    this.initializeAuth();
  }

  async signUp(signUpData: SignUpData): Promise<SignUpResult> {
    const data = await this.signUpWithAuth(signUpData);
    await this.upsertUserProfile(data.user?.id, signUpData.username);

    if (data.session) {
      await this.applySession(data.session);
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
    const { error } = await this.supabaseService.supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabaseService.supabase.auth.signOut();
    if (error) throw error;
    this.authState$.next(false);
    this.currentUser$.next(null);
    await this.router.navigate(['/login']);
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

  private async applySession(session: Session | null): Promise<void> {
    if (!session?.user) {
      this.clearAuthState();
      return;
    }

    const authUser = session.user;
    const profile = await this.fetchUserProfile(authUser.id);
    const user = this.mapToAppUser(authUser, profile);

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

  private async upsertUserProfile(userId: string | undefined, username: string): Promise<void> {
    if (!userId) return;

    const { error } = await this.supabaseService.supabase.from('user_profile').upsert(
      {
        user_id: userId,
        username,
      },
      { onConflict: 'user_id' },
    );

    if (error) throw error;
  }

  private mapToAppUser(authUser: SupabaseAuthUser, profile: UserProfileRow | null): User {
    return {
      id: authUser.id,
      email: authUser.email ?? '',
      name: profile?.username ?? authUser.email ?? '',
      avatar_url: profile?.avatar_url ?? '',
    };
  }
}
