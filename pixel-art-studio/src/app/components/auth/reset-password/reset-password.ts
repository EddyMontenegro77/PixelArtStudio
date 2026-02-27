import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  resetForm: FormGroup;
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.resetForm = this.formBuilder.nonNullable.group({
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
      passwordVerification: ['', [Validators.required]],
    });
  }

  async updatePassword(): Promise<void> {
    if (this.resetForm.invalid || this.isSubmitting()) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const { password, passwordVerification } = this.resetForm.getRawValue();
    if (password !== passwordVerification) {
      this.errorMessage.set('Passwords do not match.');
      this.successMessage.set('');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      await this.authService.updatePassword(password);
      this.successMessage.set('Password updated. Redirecting to log in...');
      setTimeout(() => {
        void this.authService.signOut();
      }, 700);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not update password. Try again.';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  goToLogin(): void {
    void this.router.navigate(['/login']);
  }
}
