import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError, tap } from 'rxjs';
import { User } from '../types/auth-interfaces/user';
import { LoginCredentials, SignUpData, AuthResponse } from '../types/auth-interfaces/auth';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly API_URL = 'http://localhost:3000/api/auth';

  private authState$ = new BehaviorSubject<boolean>(false);
  private currentUser$ = new BehaviorSubject<User | null>(this.getUserFromStorage());

  public isAuthenticated$ = this.authState$.asObservable();
  public user$ = this.currentUser$.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.checkAuthStatus();
  }

  logIn(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      catchError((error) => this.handleError(error)),
    );
  }

  signUp(data: SignUpData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/signup`, data).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      catchError((error) => this.handleError(error)),
    );
  }

  signOut(): void {
    // Call backend to invalidate token

    this.clearAuthData();
    this.authState$.next(false);
    this.currentUser$.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.authState$.value;
  }

  getCurrentUser(): User | null {
    return this.currentUser$.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  refreshUserData(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      tap((user) => {
        this.saveUserToStorage(user);
        this.currentUser$.next(user);
      }),
      catchError((error) => {
        this.signOut();
        return throwError(() => error);
      }),
    );
  }

  // Private Methods

  private handleAuthSuccess(response: AuthResponse): void {
    this.saveToken(response.token);
    this.saveUserToStorage(response.user);
    this.authState$.next(true);
    this.currentUser$.next(response.user);

    // Navigate to other route
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private checkAuthStatus(): void {
    const hasToken = this.hasToken();
    const user = this.getUserFromStorage();

    if (hasToken && user) {
      this.authState$.next(true);
      this.currentUser$.next(user);

      // check if token stills valid
    } else {
      this.clearAuthData();
    }
  }

  private saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private saveUserToStorage(user: User) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // HTTP Error Handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unexpected error ocurred';
    if (error.error instanceof ErrorEvent) errorMessage = `Error: ${error.error.message}`;
    else {
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid Credentials';
          break;
        case 403:
          errorMessage = 'You dont have permission to perform this action';
          break;
        case 404:
          errorMessage = 'Not Found';
          break;
        case 500:
          errorMessage = 'Server error. Try again later';
          break;
        default:
          errorMessage = error.error?.message || `Error ${error.status}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
