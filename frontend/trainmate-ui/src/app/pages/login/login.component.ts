import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        
        <!-- Minimal Brand Header -->
        <div class="brand-header">
          <div class="brand-logo">
            <i class="bi bi-mortarboard-fill"></i>
          </div>
          <h1 class="login-title">Sign in</h1>
          <p class="login-subtitle">to continue to <strong>TrainMate</strong></p>
        </div>

        <!-- Alert Notification -->
        <div class="login-alert alert-danger" *ngIf="errorMessage">
          <i class="bi bi-exclamation-circle-fill flex-shrink-0"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <div class="login-alert alert-info" *ngIf="infoMessage">
          <i class="bi bi-info-circle-fill flex-shrink-0"></i>
          <span>{{ infoMessage }}</span>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onLogin()" autocomplete="on">
          
          <!-- ID / Email -->
          <div class="form-field">
            <label for="loginId">Associate ID or Email</label>
            <input
              id="loginId"
              type="text"
              class="form-control-minimal"
              placeholder="e.g. coach01 or name&#64;cognizant.com"
              [(ngModel)]="loginId"
              name="loginId"
              autocomplete="username"
              required
              autofocus
            />
          </div>

          <!-- Password -->
          <div class="form-field">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label for="password" class="mb-0">Password</label>
              <button type="button" class="link-btn" (click)="onForgot()">Forgot?</button>
            </div>
            <div class="password-wrap">
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                class="form-control-minimal"
                placeholder="Enter your password"
                [(ngModel)]="password"
                name="password"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="eye-btn"
                (click)="showPassword = !showPassword"
                tabindex="-1"
                aria-label="Toggle password visibility">
                <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Keep Signed In -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <label class="check-label">
              <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" />
              <span>Remember me</span>
            </label>
          </div>

          <!-- Primary Sign In -->
          <button type="submit" class="btn-signin" [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            <span>Sign in</span>
          </button>

          <!-- Divider -->
          <div class="or-divider">
            <span>or</span>
          </div>

          <!-- Single Sign-On -->
          <button type="button" class="btn-sso" (click)="onSsoLogin()" [disabled]="loading">
            <i class="bi bi-shield-lock me-2 text-primary"></i>
            <span>Sign in with SSO</span>
          </button>
        </form>

        <!-- Discreet Demo Helper -->
        <div class="demo-section">
          <button type="button" class="demo-toggle" (click)="showDemoHints = !showDemoHints">
            <span>Quick test accounts</span>
            <i class="bi" [ngClass]="showDemoHints ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </button>

          <div class="demo-pills" *ngIf="showDemoHints">
            <button type="button" class="demo-pill" (click)="fillDemo('coach01', 'coach123')">
              Coach
            </button>
            <button type="button" class="demo-pill" (click)="fillDemo('trainer01', 'trainer123')">
              Trainer
            </button>
            <button type="button" class="demo-pill" (click)="fillDemo('admin01', 'admin123')">
              Admin
            </button>
          </div>
        </div>

        <div class="card-footer-note">
          Cognizant Academy Operations
        </div>
      </div>

      <!-- Page Footer -->
      <footer class="page-footer">
        <span>&copy; 2026 Cognizant</span>
        <span class="dot">&bull;</span>
        <button type="button" class="link-btn-subtle" (click)="onForgot()">Help</button>
        <span class="dot">&bull;</span>
        <span class="text-muted">Privacy & Terms</span>
      </footer>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 1.5rem 1rem;
      background: #f8fafc;
      background: radial-gradient(circle at 50% 10%, #ffffff 0%, #f1f5f9 100%);
      font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
    }

    .login-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 2.5rem 2.25rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 
        0 10px 25px -5px rgba(0, 0, 0, 0.05),
        0 8px 10px -6px rgba(0, 0, 0, 0.02);
      animation: fadeInCard 0.25s ease;
    }

    @keyframes fadeInCard {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .brand-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .brand-logo {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #000038 0%, #0066f5 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      margin: 0 auto 0.85rem auto;
      box-shadow: 0 4px 12px rgba(0, 102, 245, 0.25);
    }

    .login-title {
      font-size: 1.45rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.2rem;
      letter-spacing: -0.02em;
    }

    .login-subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .login-subtitle strong {
      color: #0f172a;
      font-weight: 600;
    }

    /* Alerts */
    .login-alert {
      border-radius: 8px;
      padding: 0.65rem 0.85rem;
      font-size: 0.8125rem;
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 1.15rem;
      line-height: 1.4;
    }

    .alert-danger {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
    }

    .alert-info {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }

    /* Fields */
    .form-field {
      margin-bottom: 1.05rem;
    }

    .form-field label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.35rem;
      display: block;
    }

    .form-control-minimal {
      width: 100%;
      height: 42px;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 0 0.875rem;
      font-size: 0.9rem;
      color: #0f172a;
      background: #ffffff;
      outline: none;
      transition: all 0.15s ease;
    }

    .form-control-minimal:focus {
      border-color: #0066f5;
      box-shadow: 0 0 0 3px rgba(0, 102, 245, 0.12);
    }

    .password-wrap {
      position: relative;
    }

    .password-wrap input {
      padding-right: 2.5rem;
    }

    .eye-btn {
      position: absolute;
      right: 0.65rem;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 1rem;
      padding: 0.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease;
    }

    .eye-btn:hover {
      color: #334155;
    }

    .link-btn {
      border: none;
      background: transparent;
      color: #0066f5;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .link-btn:hover {
      color: #004ecc;
      text-decoration: underline;
    }

    .check-label {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.8125rem;
      color: #64748b;
      cursor: pointer;
      user-select: none;
      margin: 0;
    }

    .check-label input {
      width: 15px;
      height: 15px;
      border-radius: 4px;
      accent-color: #0066f5;
      cursor: pointer;
    }

    /* Buttons */
    .btn-signin {
      width: 100%;
      height: 42px;
      background: #000038;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
    }

    .btn-signin:hover:not(:disabled) {
      background: #001254;
    }

    .btn-signin:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .or-divider {
      position: relative;
      text-align: center;
      margin: 1.15rem 0;
    }

    .or-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #e2e8f0;
    }

    .or-divider span {
      position: relative;
      background: #ffffff;
      padding: 0 0.5rem;
      font-size: 0.725rem;
      color: #94a3b8;
      text-transform: uppercase;
    }

    .btn-sso {
      width: 100%;
      height: 40px;
      background: #ffffff;
      color: #334155;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .btn-sso:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #0f172a;
    }

    /* Demo Hint */
    .demo-section {
      margin-top: 1.25rem;
      text-align: center;
    }

    .demo-toggle {
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 0.75rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      transition: color 0.15s ease;
    }

    .demo-toggle:hover {
      color: #475569;
    }

    .demo-pills {
      display: flex;
      gap: 0.4rem;
      justify-content: center;
      margin-top: 0.5rem;
    }

    .demo-pill {
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #475569;
      font-size: 0.725rem;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .demo-pill:hover {
      background: #e2e8f0;
      color: #0f172a;
      border-color: #cbd5e1;
    }

    .card-footer-note {
      text-align: center;
      font-size: 0.7rem;
      color: #94a3b8;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }

    /* Page Footer */
    .page-footer {
      margin-top: 1.5rem;
      font-size: 0.75rem;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .dot {
      opacity: 0.5;
    }

    .link-btn-subtle {
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 0.75rem;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .link-btn-subtle:hover {
      color: #475569;
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 2rem 1.5rem;
        box-shadow: none;
        border-color: #e2e8f0;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginId: string = 'coach01';
  password: string = 'coach123';
  loading: boolean = false;
  errorMessage: string = '';
  infoMessage: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = true;
  showDemoHints: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.redirectBasedOnRole();
    }
  }

  fillDemo(id: string, pass: string): void {
    this.loginId = id;
    this.password = pass;
    this.errorMessage = '';
    this.infoMessage = `Loaded ${id} credentials. Click Sign in to proceed.`;
  }

  onForgot(): void {
    this.infoMessage = 'Please contact your Cognizant Academy administrator or OneSpace IT Helpdesk for password resets.';
    this.errorMessage = '';
  }

  onLogin(): void {
    if (!this.loginId || !this.password) {
      this.errorMessage = 'Please enter your Associate ID or email and password.';
      this.infoMessage = '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.authService.login({
      loginId: this.loginId.trim(),
      password: this.password
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.authService.redirectBasedOnRole();
        } else {
          this.errorMessage = res.message || 'Invalid credentials. Please verify your ID and password.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Authentication failed. Please verify credentials or connection.';
      }
    });
  }

  onSsoLogin(): void {
    this.onLogin();
  }
}
