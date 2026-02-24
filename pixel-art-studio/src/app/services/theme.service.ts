import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'pixel-art-studio-theme';
  private readonly themeSignal = signal<Theme>('light');
  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    const saved = this.readStoredTheme();
    this.applyTheme(saved);
  }

  getTheme(): Theme {
    return this.themeSignal();
  }

  toggleTheme(): Theme {
    const next = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.applyTheme(next);
    return next;
  }

  private applyTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
  }

  private readStoredTheme(): Theme {
    const value = localStorage.getItem(this.storageKey);
    return value === 'dark' ? 'dark' : 'light';
  }
}
