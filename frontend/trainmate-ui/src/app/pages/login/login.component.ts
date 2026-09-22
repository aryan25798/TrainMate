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
    <div class="login-split-page">
      
      <!-- LEFT HERO COLUMN: Visual Branding & Value Proposition -->
      <div class="login-hero-pane d-none d-lg-flex flex-column justify-content-between p-5">
        
        <!-- Top Brand Header -->
        <div class="hero-brand-top">
          <div class="d-flex align-items-center gap-3">
            <div class="hero-logo-box">
              <i class="bi bi-mortarboard-fill"></i>
            </div>
            <div>
              <div class="hero-app-title">TRAINMATE</div>
              <span class="hero-app-badge">Cognizant Academy</span>
            </div>
          </div>
        </div>

        <!-- Center Value Proposition -->
        <div class="hero-center-content my-auto py-4">
          <div class="hero-pill-badge mb-3">
            <span class="live-dot"></span>
            Resource Intelligence Engine &bull; 99.98% SLA
          </div>

          <h1 class="hero-headline">
            Automated Trainer Allocation & Cohort Lifecycle Operations
          </h1>

          <p class="hero-description">
            Powering Cognizant Academy with deterministic 100-point suitability matching,
            batch XLSX ingestion, and real-time workload capacity balancing across global training streams.
          </p>

          <!-- Live Algorithmic Match Preview Card -->
          <div class="hero-preview-card mt-4 p-3.5 rounded-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="preview-tag">
                <i class="bi bi-cpu-fill text-info me-1"></i> Live Allocation Engine
              </span>
              <span class="preview-score">96.5 / 100 PTS</span>
            </div>
            <div class="preview-title">Batch: QEA26SD004 &bull; Java Full Stack & Microservices</div>
            <div class="d-flex justify-content-between align-items-center small text-white text-opacity-75 pt-2 border-top border-white border-opacity-10">
              <span><i class="bi bi-person-check-fill text-success me-1"></i> Best Match: Dr. Rajesh Kumar</span>
              <span><i class="bi bi-speedometer2 text-info me-1"></i> Workload: 2/5</span>
            </div>
          </div>

          <!-- Feature Cards Grid -->
          <div class="hero-features-grid mt-4">
            <div class="hero-feature-item">
              <div class="feature-icon blue">
                <i class="bi bi-calculator-fill"></i>
              </div>
              <div>
                <h6 class="feature-title">100-Point Allocation Algorithm</h6>
                <p class="feature-desc">Dynamic multi-variable scoring on skills, availability, and capacity.</p>
              </div>
            </div>

            <div class="hero-feature-item">
              <div class="feature-icon green">
                <i class="bi bi-file-earmark-spreadsheet-fill"></i>
              </div>
              <div>
                <h6 class="feature-title">Batch Excel Ingestion</h6>
                <p class="feature-desc">Automated XLSX multi-cohort processing with instant conflict resolution.</p>
              </div>
            </div>

            <div class="hero-feature-item">
              <div class="feature-icon cyan">
                <i class="bi bi-shield-check"></i>
              </div>
              <div>
                <h6 class="feature-title">Enterprise Governance</h6>
                <p class="feature-desc">Role-based controls for Coach, Trainer, and Admin operational workflows.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Metric Strip -->
        <div class="hero-footer-strip pt-4 border-top border-white border-opacity-10 d-flex justify-content-between text-white text-opacity-75 small">
          <div><i class="bi bi-check2-circle text-success me-1"></i> Deterministic Scoring</div>
          <div><i class="bi bi-lock-fill text-info me-1"></i> Encrypted Corporate Session</div>
          <div><i class="bi bi-lightning-charge-fill text-warning me-1"></i> Sub-Second Processing</div>
        </div>
      </div>

      <!-- RIGHT FORM COLUMN: Executive Authentication Card -->
      <div class="login-form-pane d-flex flex-column justify-content-between p-4 p-sm-5">
        
        <!-- Mobile Header Bar (Only on viewports < 992px) -->
        <div class="d-lg-none d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <div class="hero-logo-box" style="width: 34px; height: 34px; font-size: 1.1rem;">
              <i class="bi bi-mortarboard-fill"></i>
            </div>
            <div>
              <span class="fw-bold fs-5 text-dark d-block lh-1">TRAINMATE</span>
              <span class="text-muted" style="font-size: 10px;">Cognizant Academy</span>
            </div>
          </div>
          <span class="badge bg-primary-subtle text-primary border px-2 py-1">Enterprise SSO</span>
        </div>

        <!-- Center Form Container -->
        <div class="form-wrapper my-auto py-3">
          <div class="mb-4">
            <h2 class="auth-title">Associate Sign In</h2>
            <p class="auth-subtitle">Enter your corporate credentials to access your portal.</p>
          </div>

          <!-- Login Form -->
          <form (ngSubmit)="onLogin()" autocomplete="on">
            
            <!-- Identifier Field -->
            <div class="mb-3">
              <label class="form-label field-label">Associate ID or Corporate Email</label>
              <div class="input-group input-group-corporate">
                <span class="input-group-text"><i class="bi bi-person"></i></span>
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
            </div>

            <!-- Password Field -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label field-label mb-0">Password</label>
              </div>
              <div class="input-group input-group-corporate">
                <span class="input-group-text"><i class="bi bi-lock"></i></span>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control border-end-0"
                  placeholder="Enter your password"
                  [(ngModel)]="password"
                  name="password"
                  autocomplete="current-password"
                  required
                />
                <button
                  type="button"
                  class="btn btn-outline-input-addon border-start-0"
                  (click)="showPassword = !showPassword"
                  tabindex="-1"
                  title="Toggle password visibility"
                >
                  <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash text-muted' : 'bi-eye text-muted'"></i>
                </button>
              </div>
            </div>

            <!-- Options Row -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="rememberSession"
                  [(ngModel)]="rememberMe"
                  name="rememberMe"
                />
                <label class="form-check-label text-muted small user-select-none" for="rememberSession">
                  Remember this workstation
                </label>
              </div>
            </div>

            <!-- Error Message Alert -->
            <div class="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 rounded-2 mb-3" *ngIf="errorMessage">
              <i class="bi bi-exclamation-circle-fill flex-shrink-0"></i>
              <div>{{ errorMessage }}</div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn btn-login-primary w-100"
              [disabled]="loading"
            >
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              <span *ngIf="!loading">Sign In to TrainMate</span>
              <i *ngIf="!loading" class="bi bi-arrow-right ms-2"></i>
            </button>
          </form>

          <!-- Discreet Collapsible Evaluation / Role Selector -->
          <div class="demo-access-strip mt-3 text-center">
            <button
              type="button"
              class="btn-demo-toggle text-muted small border-0 bg-transparent py-1"
              (click)="showDemoAccounts = !showDemoAccounts"
            >
              <i class="bi bi-shield-lock me-1 text-primary"></i>
              <span>Evaluation & Demo Access</span>
              <i class="bi" [ngClass]="showDemoAccounts ? 'bi-chevron-up ms-1' : 'bi-chevron-down ms-1'"></i>
            </button>

            <!-- Collapsible drawer for evaluation accounts -->
            <div class="demo-accounts-drawer mt-2 p-2.5 rounded-3 border bg-light text-start" *ngIf="showDemoAccounts">
              <div class="d-flex justify-content-between align-items-center mb-2 px-1">
                <span class="small fw-semibold text-secondary" style="font-size: 0.775rem;">Preset Evaluation Roles</span>
                <span class="text-muted" style="font-size: 0.7rem;">Click to pre-fill</span>
              </div>
              <div class="d-grid gap-2" style="grid-template-columns: repeat(3, 1fr);">
                <button type="button" class="btn btn-sm btn-eval-role" (click)="fillCredentials('coach01', 'coach123')">
                  <span class="fw-bold text-dark d-block" style="font-size: 0.8rem;">Coach</span>
                  <small class="text-muted" style="font-size: 0.685rem;">coach01</small>
                </button>
                <button type="button" class="btn btn-sm btn-eval-role" (click)="fillCredentials('trainer01', 'trainer123')">
                  <span class="fw-bold text-dark d-block" style="font-size: 0.8rem;">Trainer</span>
                  <small class="text-muted" style="font-size: 0.685rem;">trainer01</small>
                </button>
                <button type="button" class="btn btn-sm btn-eval-role" (click)="fillCredentials('admin01', 'admin123')">
                  <span class="fw-bold text-dark d-block" style="font-size: 0.8rem;">Admin</span>
                  <small class="text-muted" style="font-size: 0.685rem;">admin01</small>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Security & Legal Footer -->
        <div class="auth-footer pt-3 text-center text-muted small">
          <div class="d-flex align-items-center justify-content-center gap-2 mb-1" style="font-size: 0.775rem;">
            <i class="bi bi-shield-lock-fill text-success"></i>
            <span>Encrypted Corporate Session &bull; Cognizant Security Standards</span>
          </div>
          <div style="font-size: 0.725rem; opacity: 0.85;">
            &copy; 2026 Cognizant Technology Solutions. Internal Academy Resource Operations.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-split-page {
      display: flex;
      min-height: 100vh;
      width: 100vw;
      background-color: #ffffff;
      overflow-x: hidden;
    }

    /* LEFT HERO PANE */
    .login-hero-pane {
      flex: 1.25;
      background: linear-gradient(145deg, #000038 0%, #070c24 50%, #001242 100%);
      position: relative;
      overflow: hidden;
      color: #ffffff;
    }

    .login-hero-pane::before {
      content: '';
      position: absolute;
      top: -100px;
      right: -100px;
      width: 450px;
      height: 450px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 210, 255, 0.15) 0%, rgba(0, 102, 245, 0.05) 50%, transparent 70%);
      pointer-events: none;
    }

    .login-hero-pane::after {
      content: '';
      position: absolute;
      bottom: -120px;
      left: -120px;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 102, 245, 0.2) 0%, rgba(0, 0, 56, 0.1) 60%, transparent 75%);
      pointer-events: none;
    }

    .hero-logo-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--cognizant-cyan) 0%, var(--cognizant-blue) 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.45rem;
      box-shadow: 0 4px 16px rgba(0, 210, 255, 0.4);
      flex-shrink: 0;
    }

    .hero-app-title {
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #ffffff;
      line-height: 1.1;
    }

    .hero-app-badge {
      font-size: 0.675rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--cognizant-cyan);
    }

    .hero-pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0, 210, 255, 0.1);
      border: 1px solid rgba(0, 210, 255, 0.25);
      color: #38bdf8;
      font-size: 0.775rem;
      font-weight: 600;
      padding: 0.3rem 0.85rem;
      border-radius: 20px;
      letter-spacing: 0.02em;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #38bdf8;
      box-shadow: 0 0 8px #38bdf8;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 0.4; }
      50% { opacity: 1; }
      100% { opacity: 0.4; }
    }

    .hero-headline {
      font-size: 2.35rem;
      font-weight: 800;
      letter-spacing: -0.035em;
      line-height: 1.2;
      color: #ffffff;
      margin-bottom: 1.15rem;
      max-width: 580px;
    }

    .hero-description {
      font-size: 1.05rem;
      color: #cbd5e1;
      line-height: 1.6;
      max-width: 540px;
      margin-bottom: 0;
    }

    .hero-preview-card {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(0, 210, 255, 0.3);
      backdrop-filter: blur(10px);
      max-width: 540px;
      box-shadow: 0 8px 30px rgba(0, 0, 56, 0.4);
    }

    .preview-tag {
      font-size: 0.75rem;
      font-weight: 700;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .preview-score {
      font-size: 0.825rem;
      font-weight: 800;
      color: #34d399;
      background: rgba(16, 185, 129, 0.15);
      padding: 0.15rem 0.6rem;
      border-radius: 20px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .preview-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.6rem;
    }

    .hero-features-grid {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      max-width: 540px;
    }

    .hero-feature-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      padding: 0.75rem 1.15rem;
      backdrop-filter: blur(6px);
      transition: background 0.2s ease;
    }

    .hero-feature-item:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .feature-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .feature-icon.blue { background: rgba(0, 102, 245, 0.25); color: #60a5fa; }
    .feature-icon.green { background: rgba(16, 185, 129, 0.25); color: #34d399; }
    .feature-icon.cyan { background: rgba(0, 210, 255, 0.25); color: #38bdf8; }

    .feature-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.15rem;
    }

    .feature-desc {
      font-size: 0.8rem;
      color: #94a3b8;
      margin-bottom: 0;
      line-height: 1.4;
    }

    /* RIGHT FORM PANE */
    .login-form-pane {
      flex: 1;
      max-width: 600px;
      background-color: #ffffff;
    }

    .form-wrapper {
      width: 100%;
      max-width: 430px;
      margin: 0 auto;
    }

    .auth-title {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #0f172a;
      margin-bottom: 0.35rem;
    }

    .auth-subtitle {
      color: #64748b;
      font-size: 0.925rem;
      margin-bottom: 0;
    }

    .field-label {
      font-size: 0.825rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.4rem;
    }

    .input-group-corporate .input-group-text {
      background-color: #f8fafc;
      border-color: #cbd5e1;
      color: #64748b;
      font-size: 1.1rem;
      padding-left: 0.85rem;
      padding-right: 0.85rem;
    }

    .input-group-corporate .form-control {
      border-color: #cbd5e1;
      padding: 0.7rem 0.85rem;
      font-size: 0.925rem;
      color: #0f172a;
      transition: all 0.15s ease;
    }

    .input-group-corporate .form-control:focus {
      border-color: var(--cognizant-blue);
      box-shadow: 0 0 0 3px rgba(0, 102, 245, 0.12);
    }

    .btn-outline-input-addon {
      background-color: #ffffff;
      border-color: #cbd5e1;
      color: #64748b;
    }

    .btn-outline-input-addon:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
    }

    .btn-login-primary {
      background: linear-gradient(135deg, #000038 0%, #004ecc 100%);
      color: #ffffff;
      font-weight: 600;
      font-size: 0.975rem;
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0, 102, 245, 0.25);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-login-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #000048 0%, #003ca0 100%);
      color: #ffffff;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0, 102, 245, 0.35);
    }

    /* Discreet Demo Access Drawer */
    .btn-demo-toggle {
      cursor: pointer;
      font-weight: 600;
      transition: color 0.15s ease;
    }

    .btn-demo-toggle:hover {
      color: var(--cognizant-blue) !important;
    }

    .demo-accounts-drawer {
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .btn-eval-role {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 0.4rem 0.5rem;
      border-radius: 8px;
      text-align: center;
      transition: all 0.15s ease;
    }

    .btn-eval-role:hover {
      background: #f1f5f9;
      border-color: var(--cognizant-blue);
      box-shadow: 0 2px 6px rgba(0, 102, 245, 0.1);
    }

    @media (max-width: 991.98px) {
      .login-form-pane {
        max-width: 100%;
        min-height: 100vh;
      }
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
  showDemoAccounts: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.redirectBasedOnRole();
    }
  }

  fillCredentials(id: string, pass: string): void {
    this.loginId = id;
    this.password = pass;
    this.errorMessage = '';
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
