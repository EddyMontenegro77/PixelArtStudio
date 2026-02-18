import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginCredentials } from '../../../types/auth-interfaces/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    });
  }

  async tryLogIn(): Promise<void> {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const raw = this.loginForm.getRawValue();
      const credentials: LoginCredentials = {
        email: raw.email,
        password: raw.password,
      };

      await this.authService.logIn(credentials);
      await this.router.navigate(['/profile']);
    } catch (error) {
      this.errorMessage = this.getLoginErrorMessage(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private getLoginErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) return 'Login failed';

    const message = error.message.toLowerCase();
    if (message.includes('email not confirmed')) {
      return 'You must confirm your email before logging in.';
    }
    if (message.includes('invalid login credentials')) {
      return 'Invalid credentials.';
    }

    return error.message;
  }
}
