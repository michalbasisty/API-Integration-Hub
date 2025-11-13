import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotifyService } from '../../services/notify.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h2>Create Account</h2>
          <p>Join PulseAPI and start monitoring your APIs</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                formControlName="firstName"
                placeholder="Enter your first name"
                class="form-input"
                [class.error]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
              >
              <div class="error-message" *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
                <span *ngIf="registerForm.get('firstName')?.errors?.['required']">First name is required</span>
              </div>
            </div>

            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                formControlName="lastName"
                placeholder="Enter your last name"
                class="form-input"
                [class.error]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
              >
              <div class="error-message" *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
                <span *ngIf="registerForm.get('lastName')?.errors?.['required']">Last name is required</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="Enter your email"
              class="form-input"
              [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            >
            <div class="error-message" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="Create a password"
              class="form-input"
              [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
            >
            <div class="error-message" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 8 characters</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              formControlName="confirmPassword"
              placeholder="Confirm your password"
              class="form-input"
              [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
            >
            <div class="error-message" *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
              <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
              <span *ngIf="registerForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</span>
            </div>
          </div>

          <button type="submit" class="register-btn" [disabled]="registerForm.invalid || isLoading">
            <span *ngIf="isLoading" class="spinner"></span>
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="register-footer">
          <p>Already have an account?
            <a routerLink="/login" class="login-link">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .register-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      padding: 3rem;
      width: 100%;
      max-width: 500px;
    }

    .register-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .register-header h2 {
      color: #2d3748;
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 600;
    }

    .register-header p {
      color: #718096;
      margin: 0;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 500;
      color: #2d3748;
    }

    .form-input {
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input.error {
      border-color: #e53e3e;
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .register-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.875rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .register-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .register-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .register-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e2e8f0;
    }

    .register-footer p {
      color: #718096;
      margin: 0;
    }

    .login-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .login-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .register-container {
        padding: 1rem;
      }

      .register-card {
        padding: 2rem;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notifyService: NotifyService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { firstName, lastName, email, password } = this.registerForm.value;

      this.authService.register({ email, password, firstName, lastName }).subscribe({
        next: () => {
          this.notifyService.success('Account created successfully! Please log in.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false;
          const message = error.error?.message || 'Registration failed. Please try again.';
          this.notifyService.error(message);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}