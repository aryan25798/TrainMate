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
    <div class="d-flex align-items-center justify-content-center min-vh-100 p-3 position-relative overflow-hidden"
         style="background: radial-gradient(circle at 15% 25%, #001254 0%, #000038 45%, #070c24 100%);">
      
      <!-- Subtle Decorative Floating Glow Orbs -->
      <div class="position-absolute" style="top: -100px; left: -100px; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(0, 102, 245, 0.25) 0%, transparent 70%); filter: blur(40px); pointer-events: none;"></div>
      <div class="position-absolute" style="bottom: -120px; right: -80px; width: 450px; height: 450px; border-radius: 50%; background: radial-gradient(circle, rgba(0, 210, 255, 0.2) 0%, transparent 70%); filter: blur(50px); pointer-events: none;"></div>

      <div class="card border-0 shadow-lg position-relative" style="max-width: 480px; width: 100%; border-radius: 22px; overflow: hidden; backdrop-filter: blur(16px); z-index: 2;">
        
        <!-- Cognizant Header -->
        <div class="p-4 text-center position-relative" style="background: linear-gradient(135deg, #000038 0%, #0038a8 55%, #0066f5 100%); color: white;">
          <div class="d-inline-flex align-items-center gap-1.5 mb-2 px-2.5 py-1 rounded-pill"
               style="background: rgba(0, 210, 255, 0.15); border: 1px solid rgba(0, 210, 255, 0.35);">
            <i class="bi bi-mortarboard-fill text-info small"></i>
            <span style="font-size: 0.725rem; font-weight: 800; letter-spacing: 0.09em; color: #00d2ff;">COGNIZANT ACADEMY</span>
          </div>
          <h1 class="h2 fw-bold mb-1 letter-spacing-tight text-white">TRAINMATE</h1>
          <p class="mb-0 text-white-50 small">Automatic Cohort & Trainer Allocation System</p>
        </div>

        <!-- Form Body -->
        <div class="card-body p-4 p-md-4.5 bg-white">
          <form (ngSubmit)="onLogin()">
            <div class="mb-3">
              <label class="form-label fw-bold text-secondary small">Cognizant ID / Username</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-person-fill"></i></span>
                <input
                  type="text"
                  class="form-control bg-light border-start-0 ps-0"
                  placeholder="coach01 / trainer01 / admin01"
                  [(ngModel)]="loginId"
                  name="loginId"
                  required
                />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold text-secondary small">Password</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-lock-fill"></i></span>
                <input
                  type="password"
                  class="form-control bg-light border-start-0 ps-0"
                  placeholder="Enter your password"
                  [(ngModel)]="password"
                  name="password"
                  required
                />
              </div>
            </div>

            <!-- Error message alert -->
            <div class="alert alert-danger py-2 small d-flex align-items-center gap-2" *ngIf="errorMessage">
              <i class="bi bi-exclamation-circle-fill"></i>
              <span>{{ errorMessage }}</span>
            </div>

            <button type="submit" class="btn btn-primary-custom w-100 justify-content-center py-2.5 mt-2" [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Authenticating...' : 'Sign In to Portal' }}
            </button>
          </form>

          <!-- Quick Fill Demo Accounts -->
          <div class="mt-4 pt-3 border-top">
            <div class="d-flex justify-content-between align-items-center mb-2.5">
              <small class="text-muted fw-bold text-uppercase" style="font-size: 0.7rem;">Demo Personas (1-Click Test):</small>
              <span class="badge bg-success-subtle text-success small fw-semibold">MySQL Ready</span>
            </div>

            <div class="row g-2">
              <div class="col-4">
                <button type="button" class="btn btn-sm btn-outline-primary w-100 py-2 d-flex flex-column align-items-center gap-1"
                        (click)="fillCredentials('coach01', 'password123')">
                  <i class="bi bi-person-workspace fs-5"></i>
                  <span class="fw-bold small">Coach</span>
                </button>
              </div>

              <div class="col-4">
                <button type="button" class="btn btn-sm btn-outline-success w-100 py-2 d-flex flex-column align-items-center gap-1"
                        (click)="fillCredentials('trainer01', 'password123')">
                  <i class="bi bi-person-video3 fs-5"></i>
                  <span class="fw-bold small">Trainer</span>
                </button>
              </div>

              <div class="col-4">
                <button type="button" class="btn btn-sm btn-outline-dark w-100 py-2 d-flex flex-column align-items-center gap-1"
                        (click)="fillCredentials('admin01', 'password123')">
                  <i class="bi bi-shield-lock-fill fs-5"></i>
                  <span class="fw-bold small">Admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- System Footer -->
        <div class="px-4 py-2.5 bg-light border-top text-center">
          <small class="text-muted" style="font-size: 0.75rem;">
            Cognizant Digital Academy &bull; Automatic Allocation System
          </small>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  loginId: string = 'coach01';
  password: string = 'password123';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.redirectBasedOnRole();
    }
  }

  fillCredentials(u: string, p: string): void {
    this.loginId = u;
    this.password = p;
    this.errorMessage = '';
    this.onLogin();
  }

  onLogin(): void {
    if (!this.loginId || !this.password) {
      this.errorMessage = 'Please enter both login ID and password';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ loginId: this.loginId, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.authService.redirectBasedOnRole();
        } else {
          this.errorMessage = res.message || 'Invalid login ID or password';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to connect to backend server. Make sure Spring Boot is running on port 8080.';
      }
    });
  }
}
