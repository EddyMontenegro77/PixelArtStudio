import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-user-menu',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss',
})
export class UserMenu {
  readonly isAuthenticated$;
  userAvatar: string = '/icons/user_icon_black.svg';
  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  async logOut(): Promise<void> {
    await this.authService.signOut();
  }
}
