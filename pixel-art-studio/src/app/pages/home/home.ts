import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly isAuthenticated$;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  goToEditor() {
    this.router.navigate(['/editor']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToLogIn() {
    this.router.navigate(['/login']);
  }

  goToSignUp() {
    this.router.navigate(['/signup']);
  }
}
