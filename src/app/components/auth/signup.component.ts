import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">🌸</div>
          <h1>Create Account</h1>
          <p>Join Floral Management System</p>
        </div>

        <form class="auth-form" (submit)="onSubmit($event)">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              [(ngModel)]="fullName"
              name="fullName"
              placeholder="Enter your full name"
              required
              autocomplete="name"
            >
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              placeholder="Enter your email"
              required
              autocomplete="email"
            >
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Create a password (min 6 characters)"
              required
              minlength="6"
              autocomplete="new-password"
            >
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              required
              autocomplete="new-password"
            >
          </div>

          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>

          <div *ngIf="success" class="success-message">
            {{ success }}
          </div>

          <button type="submit" class="btn-submit" [disabled]="loading">
            {{ loading ? 'Creating account...' : 'Sign Up' }}
          </button>
        </form>

        <!-- Hidden signup page - accessible only via direct URL -->
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .auth-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 440px;
      overflow: hidden;
    }

    .auth-header {
      text-align: center;
      padding: 3rem 2rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .logo {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .auth-header h1 {
      margin: 0 0 0.5rem;
      font-size: 2rem;
      font-weight: 700;
    }

    .auth-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 1rem;
    }

    .auth-form {
      padding: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #2d3748;
      font-size: 0.875rem;
    }

    .form-group input {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.2s;
      background: #f7fafc;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .error-message {
      background: #fed7d7;
      color: #c53030;
      padding: 0.875rem 1rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      border-left: 4px solid #c53030;
    }

    .success-message {
      background: #c6f6d5;
      color: #22543d;
      padding: 0.875rem 1rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      border-left: 4px solid #22543d;
    }

    .btn-submit {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .auth-footer {
      text-align: center;
      padding: 1.5rem 2rem 2rem;
      background: #f7fafc;
      border-top: 1px solid #e2e8f0;
    }

    .auth-footer p {
      margin: 0;
      color: #4a5568;
      font-size: 0.875rem;
    }

    .auth-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }

    .auth-footer a:hover {
      color: #764ba2;
    }

    @media (max-width: 768px) {
      .auth-container {
        padding: 1rem;
      }

      .auth-card {
        max-width: 100%;
      }

      .auth-header {
        padding: 2rem 1.5rem 1.5rem;
      }

      .logo {
        font-size: 3rem;
      }

      .auth-header h1 {
        font-size: 1.5rem;
      }

      .auth-form {
        padding: 1.5rem;
      }
    }
  `]
})
export class SignupComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit(event: Event) {
    event.preventDefault();
    
    // Validation
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters long';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const { data, error } = await this.authService.signUp(
      this.email,
      this.password,
      this.fullName
    );

    if (error) {
      this.error = error;
      this.loading = false;
    } else {
      this.success = 'Account created successfully! Please check your email to verify your account.';
      this.loading = false;
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    }
  }
}
