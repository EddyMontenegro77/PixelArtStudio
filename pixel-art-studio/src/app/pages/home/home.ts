import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ProjectService } from '../../services/project.service';

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
    private projectService: ProjectService,
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  goToEditor() {
    this.projectService.resetProjectState();
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
