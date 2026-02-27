import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Theme, ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-user-menu',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss',
})
export class UserMenu {
  readonly isAuthenticated$;
  readonly user$;
  readonly theme;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.user$ = this.authService.user$;
    this.theme = this.themeService.theme;
  }

  get defaultAvatar(): string {
    return this.theme() === 'light' ? '/icons/user_icon_white.svg' : '/icons/user_icon_black.svg';
  }

  async logOut(): Promise<void> {
    await this.authService.signOut();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  get currentTheme(): Theme {
    return this.theme();
  }
}
