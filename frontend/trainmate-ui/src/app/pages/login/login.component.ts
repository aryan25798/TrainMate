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
    <div class="login-page-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4">
      
      <!-- Ambient Background Illumination -->
      <div class="glow-orb glow-orb-1"></div>
      <div class="glow-orb glow-orb-2"></div>
      <div class="glow-orb glow-orb-3"></div>

      <!-- Main Login Container (Split Layout on Desktop) -->
      <div class="container" style="max-width: 1040px; position: relative; z-index: 2;">
        <div class="row g-0 rounded-4 overflow-hidden shadow-2xl border border-white-10 login-main-card">
          
          <!-- Left Column: Executive Brand Showcase (Hidden on Mobile) -->
          <div class="col-lg-6 d-none d-lg-flex flex-column justify-content-between p-5 text-white brand-hero-panel">
            <div>
              <!-- Corporate Brand Chip -->
              <div class="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-4 brand-chip">
                <i class="bi bi-mortarboard-fill text-info"></i>
                <span class="brand-chip-text">COGNIZANT DIGITAL ACADEMY</span>
              </div>

              <!-- Main Hero Header -->
              <h1 class="display-6 fw-bold mb-3 text-white letter-spacing-tight">
                TrainMate <span class="text-gradient-cyan">Enterprise</span>
              </h1>
              <p class="text-slate-300 fs-6 leading-relaxed mb-4">
                Automated, fair, and algorithmic resource allocation system engineered for high-throughput technical cohort delivery across global delivery centers.
              </p>

              <!-- Value Pillar Points -->
              <div class="d-flex flex-column gap-3.5 my-4">
                <div class="d-flex align-items-start gap-3">
                  <div class="feature-icon-box">
                    <i class="bi bi-cpu-fill text-info"></i>
                  </div>
                  <div>
                    <h6 class="fw-bold mb-0 text-white">100-Point Algorithmic Matching</h6>
                    <small class="text-slate-400">Deterministic scoring across skills, timeline availability, and historical delivery track record.</small>
                  </div>
                </div>

                <div class="d-flex align-items-start gap-3">
                  <div class="feature-icon-box">
                    <i class="bi bi-speedometer2 text-info"></i>
                  </div>
                  <div>
                    <h6 class="fw-bold mb-0 text-white">Automated Capacity Balancing</h6>
                    <small class="text-slate-400">Dynamic workload monitoring preventing trainer saturation and ensuring optimal learner coverage.</small>
                  </div>
                </div>

                <div class="d-flex align-items-start gap-3">
                  <div class="feature-icon-box">
                    <i class="bi bi-shield-check text-info"></i>
                  </div>
                  <div>
                    <h6 class="fw-bold mb-0 text-white">Role-Based Governance</h6>
                    <small class="text-slate-400">Strict separation of duties across Coaches, Technical Trainers, and Academy Administrators.</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Security & Compliance Footer -->
            <div class="pt-4 border-top border-white-10 d-flex align-items-center justify-content-between small text-slate-400">
              <span class="d-flex align-items-center gap-1.5">
                <i class="bi bi-shield-lock-fill text-info"></i> SSO & Role Protected
              </span>
              <span>ISO 27001 Certified</span>
            </div>
          </div>

          <!-- Right Column: Corporate Authentication Form -->
          <div class="col-lg-6 bg-white p-4 p-md-5 d-flex flex-column justify-content-center">
            
            <!-- Mobile Brand Header (Visible on Mobile only) -->
            <div class="d-lg-none text-center mb-4">
              <div class="d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill mb-2 bg-light border">
                <i class="bi bi-mortarboard-fill text-primary small"></i>
                <span class="small fw-bold text-primary">COGNIZANT ACADEMY</span>
              </div>
              <h2 class="h3 fw-bold text-dark mb-1">TrainMate</h2>
              <p class="text-muted small mb-0">Cohort & Trainer Allocation System</p>
            </div>

            <!-- Desktop Form Title -->
            <div class="mb-4">
              <h2 class="h3 fw-bold text-dark mb-1 d-none d-lg-block">Sign In</h2>
              <p class="text-muted small mb-0">Enter your Cognizant credentials to access the management portal.</p>
            </div>

            <form (ngSubmit)="onLogin()">
              
              <!-- Identifier Input -->
              <div class="mb-3.5">
                <label class="form-label fw-semibold text-dark small mb-1.5">Cognizant Associate ID or Email</label>
                <div class="input-group input-group-lg custom-input-group">
                  <span class="input-group-text bg-light border-end-0 text-muted ps-3">
                    <i class="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control bg-light border-start-0 ps-2 fs-6"
                    placeholder="e.g. coach01 or associate@cognizant.com"
                    [(ngModel)]="loginId"
                    name="loginId"
                    autocomplete="username"
                    required
                  />
                </div>
              </div>

              <!-- Password Input with Toggle -->
              <div class="mb-3.5">
                <div class="d-flex justify-content-between align-items-center mb-1.5">
                  <label class="form-label fw-semibold text-dark small mb-0">Corporate Password</label>
                  <a href="javascript:void(0)" (click)="showHelp = !showHelp" class="small text-primary text-decoration-none fw-medium">
                    Need help?
                  </a>
                </div>
                <div class="input-group input-group-lg custom-input-group">
                  <span class="input-group-text bg-light border-end-0 text-muted ps-3">
                    <i class="bi bi-lock"></i>
                  </span>
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    class="form-control bg-light border-start-0 border-end-0 ps-2 fs-6"
                    placeholder="••••••••••••"
                    [(ngModel)]="password"
                    name="password"
                    autocomplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    class="input-group-text bg-light border-start-0 text-muted pe-3"
                    style="cursor: pointer;"
                    (click)="showPassword = !showPassword"
                    title="Toggle password visibility"
                  >
                    <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
              </div>

              <!-- Remember Me & Policy -->
              <div class="d-flex align-items-center justify-content-between mb-4">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="rememberWorkstation" [(ngModel)]="rememberMe" name="rememberMe" />
                  <label class="form-check-label text-muted small" for="rememberWorkstation">
                    Remember this workstation
                  </label>
                </div>
              </div>

              <!-- Help Box (Collapsible) -->
              <div *ngIf="showHelp" class="alert alert-info py-2.5 px-3 small rounded-3 mb-3">
                <div class="fw-bold mb-1"><i class="bi bi-info-circle-fill me-1"></i> Authorized Roles:</div>
                <ul class="mb-0 ps-3 text-secondary">
                  <li><strong>Coach:</strong> <code>coach01</code> / <code>password123</code></li>
                  <li><strong>Trainer:</strong> <code>trainer01</code> / <code>password123</code></li>
                  <li><strong>Administrator:</strong> <code>admin01</code> / <code>password123</code></li>
                </ul>
              </div>

              <!-- Error Alert -->
              <div class="alert alert-danger py-2.5 px-3 small d-flex align-items-center gap-2 rounded-3 mb-3" *ngIf="errorMessage">
                <i class="bi bi-exclamation-octagon-fill fs-5 flex-shrink-0"></i>
                <div>{{ errorMessage }}</div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-primary btn-lg w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 login-submit-btn shadow-sm"
                [disabled]="loading"
              >
                <span *ngIf="loading" class="spinner-border spinner-border-sm"></span>
                <span>{{ loading ? 'Verifying Credentials...' : 'Sign In to Portal' }}</span>
                <i *ngIf="!loading" class="bi bi-arrow-right"></i>
              </button>
            </form>

            <!-- Corporate Disclaimer -->
            <div class="mt-4 pt-3 text-center border-top">
              <p class="text-muted text-xs mb-0" style="font-size: 0.75rem; line-height: 1.4;">
                This system is restricted to authorized Cognizant associates and contractors. Unauthorized access is strictly prohibited and subject to disciplinary action and monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page-wrapper {
      background: radial-gradient(circle at 10% 20%, #001254 0%, #000038 45%, #05081c 100%);
      position: relative;
      overflow: hidden;
    }

    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      pointer-events: none;
      opacity: 0.45;
    }
    .glow-orb-1 {
      top: -120px;
      left: -100px;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(0, 102, 245, 0.4) 0%, transparent 70%);
    }
    .glow-orb-2 {
      bottom: -150px;
      right: -100px;
      width: 520px;
      height: 520px;
      background: radial-gradient(circle, rgba(0, 210, 255, 0.3) 0%, transparent 70%);
    }
    .glow-orb-3 {
      top: 40%;
      left: 50%;
      width: 350px;
      height: 350px;
      background: radial-gradient(circle, rgba(0, 56, 168, 0.25) 0%, transparent 70%);
    }

    .login-main-card {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 40, 0.45);
    }

    .brand-hero-panel {
      background: linear-gradient(145deg, #000038 0%, #001b6b 55%, #004ecc 100%);
      position: relative;
    }
    .brand-hero-panel::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      pointer-events: none;
    }

    .brand-chip {
      background: rgba(0, 210, 255, 0.12);
      border: 1px solid rgba(0, 210, 255, 0.3);
      width: fit-content;
    }
    .brand-chip-text {
      font-size: 0.725rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #00d2ff;
    }

    .text-gradient-cyan {
      background: linear-gradient(135deg, #00d2ff 0%, #ffffff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .feature-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .custom-input-group .form-control:focus,
    .custom-input-group .input-group-text:focus-within {
      background-color: #ffffff !important;
      border-color: #0066f5;
      box-shadow: none;
    }

    .custom-input-group .form-control {
      transition: all 0.2s ease;
    }

    .login-submit-btn {
      background: linear-gradient(135deg, #0052cc 0%, #0066f5 100%);
      border: none;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .login-submit-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #0043a8 0%, #0052cc 100%);
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(0, 102, 245, 0.35);
    }
    .login-submit-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .border-white-10 {
      border-color: rgba(255, 255, 255, 0.1) !important;
    }
    .text-slate-300 {
      color: #cbd5e1;
    }
    .text-slate-400 {
      color: #94a3b8;
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
  showHelp: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.redirectBasedOnRole();
    }
  }

  onLogin(): void {
    if (!this.loginId || !this.password) {
      this.errorMessage = 'Please enter your Cognizant Associate ID or email and password.';
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
          this.errorMessage = res.message || 'Invalid credentials. Please verify your Associate ID and password.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Authentication failed. Please verify your credentials or server connectivity.';
      }
    });
  }
}
