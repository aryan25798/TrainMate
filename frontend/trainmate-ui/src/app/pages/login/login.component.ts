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
    <div class="login-wrapper min-vh-100 d-flex flex-column justify-content-between p-3 p-md-4">
      
      <!-- Top Minimal Header -->
      <div class="d-flex justify-content-between align-items-center w-100 px-md-3">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-mortarboard-fill text-primary fs-4"></i>
          <span class="fw-bold text-dark fs-5 tracking-tight">Cognizant Academy</span>
        </div>
        <span class="badge bg-light text-secondary border px-2.5 py-1.5 small fw-normal">
          Resource Portal
        </span>
      </div>

      <!-- Center Card Container -->
      <div class="d-flex justify-content-center align-items-center my-auto py-4">
        <div class="card login-card border shadow-sm">
          <div class="card-body p-4 p-sm-5">
            
            <!-- Header -->
            <div class="mb-4 text-center">
              <h1 class="h4 fw-bold text-dark mb-1">Sign In</h1>
              <p class="text-muted small mb-0">Use your corporate ID or email to access TrainMate</p>
            </div>

            <!-- Form -->
            <form (ngSubmit)="onLogin()">
              
              <!-- Identifier Input -->
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark mb-1">Associate ID or Email</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. coach01 or name@cognizant.com"
                  [(ngModel)]="loginId"
                  name="loginId"
                  autocomplete="username"
                  required
                />
              </div>

              <!-- Password Input -->
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark mb-1">Password</label>
                <div class="input-group">
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    class="form-control border-end-0"
                    placeholder="Enter password"
                    [(ngModel)]="password"
                    name="password"
                    autocomplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary border-start-0 bg-white"
                    style="border-color: #dee2e6;"
                    (click)="showPassword = !showPassword"
                    tabindex="-1"
                    title="Toggle password visibility"
                  >
                    <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash text-muted' : 'bi-eye text-muted'"></i>
                  </button>
                </div>
              </div>

              <!-- Remember Me -->
              <div class="d-flex align-items-center justify-content-between mb-4">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="rememberWorkstation"
                    [(ngModel)]="rememberMe"
                    name="rememberMe"
                  />
                  <label class="form-check-label text-muted small" for="rememberWorkstation">
                    Remember me
                  </label>
                </div>
              </div>

              <!-- Error Alert -->
              <div class="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 rounded-2 mb-3" *ngIf="errorMessage">
                <i class="bi bi-exclamation-circle-fill flex-shrink-0"></i>
                <div>{{ errorMessage }}</div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-primary w-100 py-2.5 fw-semibold login-btn"
                [disabled]="loading"
              >
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                <span>{{ loading ? 'Authenticating...' : 'Sign In' }}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center text-muted small py-2" style="font-size: 0.8rem;">
        &copy; 2026 Cognizant Technology Solutions. Internal Academy System.
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      background-color: #f8fafc;
    }

    .tracking-tight {
      letter-spacing: -0.025em;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      border-radius: 12px;
      border-color: #e2e8f0 !important;
      background: #ffffff;
    }

    .form-control {
      border-radius: 8px;
      border-color: #cbd5e1;
      padding: 0.65rem 0.85rem;
      font-size: 0.925rem;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .form-control:focus {
      border-color: #0066f5;
      box-shadow: 0 0 0 3px rgba(0, 102, 245, 0.12);
    }

    .login-btn {
      background-color: #000048;
      border-color: #000048;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: background-color 0.15s ease;
    }

    .login-btn:hover:not(:disabled) {
      background-color: #0033a0;
      border-color: #0033a0;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginId: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.redirectBasedOnRole();
    }
  }

  onLogin(): void {
    if (!this.loginId || !this.password) {
      this.errorMessage = 'Please enter your Associate ID or email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

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
}
