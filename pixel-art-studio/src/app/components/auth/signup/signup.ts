import { Component, signal } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { SignUpData } from '../../../types/auth-interfaces/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  signUpForm: FormGroup;
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.signUpForm = this.formBuilder.nonNullable.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(30),
            Validators.pattern(/^[a-zA-Z0-9_]+$/),
          ],
        ],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
        passwordVerification: ['', [Validators.required]],
      },
      {
        validators: [this.passwordsMatchValidator()],
      },
    );
  }

  async trySignUp(): Promise<void> {
    if (this.signUpForm.invalid || this.isSubmitting()) {
      this.signUpForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const raw = this.signUpForm.getRawValue();
      const signUpData: SignUpData = {
        username: raw.username.trim(),
        email: raw.email,
        password: raw.password,
      };

      const result = await this.authService.signUp(signUpData);
      if (result.requiresEmailConfirmation) {
        this.successMessage.set('Check your email to confirm your account.');
        await this.router.navigate(['/login']);
        return;
      }

      await this.router.navigate(['/profile']);
    } catch (error) {
      this.errorMessage.set(this.getSignUpErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private passwordsMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get('password')?.value;
      const confirm = group.get('passwordVerification')?.value;
      return password === confirm ? null : { passwordMismatch: true };
    };
  }

  private getSignUpErrorMessage(error: unknown): string {
    const rawError = this.extractRawError(error);
    if (!rawError) return 'Sign up failed.';

    if (rawError.code === 'user_already_exists') {
      return 'This email is already registered.';
    }
    if (rawError.code === 'invalid_email') {
      return 'Invalid email address.';
    }
    if (rawError.code === 'weak_password') {
      return 'Password does not meet minimum requirements.';
    }

    return rawError.message ?? 'Sign up failed.';
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
