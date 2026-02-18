import { Component } from '@angular/core';
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
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
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
    if (this.signUpForm.invalid || this.isSubmitting) {
      this.signUpForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const raw = this.signUpForm.getRawValue();
      const signUpData: SignUpData = {
        username: raw.username.trim(),
        email: raw.email,
        password: raw.password,
      };

      const result = await this.authService.signUp(signUpData);
      if (result.requiresEmailConfirmation) {
        this.successMessage = 'Check your email to confirm your account.';
        await this.router.navigate(['/login']);
        return;
      }

      await this.router.navigate(['/profile']);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Sign Up failed';
    } finally {
      this.isSubmitting = false;
    }
  }

  private passwordsMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get('password')?.value;
      const confirm = group.get('passwordVerification')?.value;
      return password === confirm ? null : { passwordMismatch: true };
    };
  }
}
