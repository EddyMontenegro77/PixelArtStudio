import { Component, signal } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginCredentials } from '../../../types/auth-interfaces/auth';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly recoveryMessage = signal('');
  readonly verificationMessage = signal('');

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    });

    const verifyEmail = this.activatedRoute.snapshot.queryParamMap.get('verifyEmail');
    const email = this.activatedRoute.snapshot.queryParamMap.get('email');

    if (verifyEmail === '1') {
      this.verificationMessage.set('Check your email to confirm your account before logging in.');
      if (email) {
        this.loginForm.patchValue({ email });
      }
    }
  }

  async tryLogIn(): Promise<void> {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.recoveryMessage.set('');
    this.verificationMessage.set('');

    try {
      const raw = this.loginForm.getRawValue();
      const credentials: LoginCredentials = {
        email: raw.email,
        password: raw.password,
      };

      await this.authService.logIn(credentials);
      try {
        await this.projectService.migrateLocalDraftToCloudForCurrentUser();
      } catch (migrationError) {
        console.error('Local draft migration failed after login:', migrationError);
      }
      await this.router.navigate(['/profile']);
    } catch (error) {
      this.errorMessage.set(this.getLoginErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async recoverPassword(): Promise<void> {
    const emailControl = this.loginForm.controls['email'];
    if (emailControl.invalid) {
      emailControl.markAsTouched();
      this.errorMessage.set('Enter a valid email to recover password.');
      this.recoveryMessage.set('');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.recoveryMessage.set('');

    try {
      const email = this.loginForm.getRawValue().email;
      await this.authService.recoverPassword(email);
      this.recoveryMessage.set('Password reset email sent. Check your inbox.');
    } catch (error) {
      this.errorMessage.set(this.getLoginErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private getLoginErrorMessage(error: unknown): string {
    const rawError = this.extractRawError(error);
    if (!rawError) return 'Login failed';

    if (rawError.code === 'invalid_credentials') {
      return 'Invalid credentials.';
    }

    if (rawError.code === 'email_not_confirmed') {
      return 'You must confirm your email before logging in.';
    }

    return rawError.message ?? 'Login failed';
  }

  private extractRawError(error: unknown): { code?: string; message?: string } | null {
    if (typeof error === 'object' && error !== null) {
      const raw = error as { code?: unknown; message?: unknown };
      return {
        code: typeof raw.code === 'string' ? raw.code : undefined,
        message: typeof raw.message === 'string' ? raw.message : undefined,
      };
    }

    if (error instanceof Error) {
      return { message: error.message };
    }

    return null;
  }
}
