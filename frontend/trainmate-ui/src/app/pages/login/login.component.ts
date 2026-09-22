import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type UserRole = 'COACH' | 'TRAINER' | 'ADMIN';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-viewport">
      
      <!-- Background Ambient Glow & Grid -->
      <div class="ambient-glow glow-1"></div>
      <div class="ambient-glow glow-2"></div>
      <div class="grid-overlay"></div>

      <!-- Main Container -->
      <div class="auth-container">
        
        <!-- Brand Header Above Card -->
        <div class="auth-brand-header text-center mb-4">
          <div class="brand-badge-wrapper mb-2">
            <div class="brand-icon-box">
              <i class="bi bi-mortarboard-fill"></i>
            </div>
            <div class="brand-text">
              <span class="brand-title">TRAINMATE</span>
              <span class="brand-division">Cognizant Academy</span>
            </div>
          </div>
          <p class="brand-tagline">Enterprise Cohort Lifecycle & Trainer Allocation Portal</p>
        </div>

        <!-- Authentication Card -->
        <div class="auth-card">
          
          <!-- Card Header & Role Persona Selector -->
          <div class="card-header-section">
            <h2 class="card-title">Associate Sign In</h2>
            <p class="card-subtitle">Choose your portal workspace or enter credentials</p>

            <!-- Segmented Role Selector -->
            <div class="role-selector-pills">
              <button
                type="button"
                class="role-pill"
                [class.active]="selectedRole === 'COACH'"
                (click)="switchRole('COACH')">
                <i class="bi bi-person-workspace me-1.5"></i>
                <span>Coach</span>
              </button>
              <button
                type="button"
                class="role-pill"
                [class.active]="selectedRole === 'TRAINER'"
                (click)="switchRole('TRAINER')">
                <i class="bi bi-person-video3 me-1.5"></i>
                <span>Trainer</span>
              </button>
              <button
                type="button"
                class="role-pill"
                [class.active]="selectedRole === 'ADMIN'"
                (click)="switchRole('ADMIN')">
                <i class="bi bi-shield-lock me-1.5"></i>
                <span>Admin</span>
              </button>
            </div>
          </div>

          <!-- Login Form -->
          <form (ngSubmit)="onLogin()" autocomplete="on" class="auth-form">
            
            <!-- Associate ID / Email Field -->
            <div class="form-group mb-3">
              <label class="form-label" for="loginIdInput">
                <span>Associate ID or Corporate Email</span>
                <span class="text-muted small fw-normal">{{ getRoleEmailHint() }}</span>
              </label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <i class="bi bi-person"></i>
                </span>
                <input
                  id="loginIdInput"
                  type="text"
                  class="form-input"
                  placeholder="e.g. coach01 or name@cognizant.com"
                  [(ngModel)]="loginId"
                  name="loginId"
                  autocomplete="username"
                  required
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="form-group mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label mb-0" for="passwordInput">Password</label>
                <button
                  type="button"
                  class="btn-forgot-link"
                  (click)="fillDefaultPassword()"
                  tabindex="-1">
                  Reset default
                </button>
              </div>
              <div class="input-wrapper">
                <span class="input-icon">
                  <i class="bi bi-lock"></i>
                </span>
                <input
                  id="passwordInput"
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Enter your password"
                  [(ngModel)]="password"
                  name="password"
                  autocomplete="current-password"
                  required
                />
                <button
                  type="button"
                  class="input-action-btn"
                  (click)="showPassword = !showPassword"
                  tabindex="-1"
                  [title]="showPassword ? 'Hide password' : 'Show password'">
                  <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Options Row -->
            <div class="d-flex justify-content-between align-items-center mb-3.5">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  class="custom-checkbox"
                  [(ngModel)]="rememberMe"
                  name="rememberMe"
                />
                <span>Keep session active</span>
              </label>
              <span class="session-badge">
                <span class="status-indicator"></span>
                Secure TLS 1.3
              </span>
            </div>

            <!-- Error Banner -->
            <div class="error-banner mb-3" *ngIf="errorMessage">
              <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
              <div class="error-text">{{ errorMessage }}</div>
            </div>

            <!-- Primary Sign In Button -->
            <button
              type="submit"
              class="btn-submit"
              [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              <span *ngIf="!loading">Sign In as {{ getRoleDisplayName() }}</span>
              <i *ngIf="!loading" class="bi bi-arrow-right ms-2"></i>
            </button>

            <!-- Divider -->
            <div class="auth-divider my-3">
              <span>or</span>
            </div>

            <!-- Single Sign-On Button -->
            <button
              type="button"
              class="btn-sso"
              (click)="onSsoLogin()"
              [disabled]="loading">
              <i class="bi bi-building-check me-2 text-primary"></i>
              <span>Single Sign-On (Cognizant SSO)</span>
            </button>
          </form>

          <!-- Card Security Footer -->
          <div class="card-security-footer">
            <i class="bi bi-shield-check text-success me-1.5"></i>
            <span>Authorized Cognizant Associates &bull; 256-bit AES Encryption</span>
          </div>
        </div>

        <!-- Global Legal Footer -->
        <div class="auth-global-footer text-center mt-4">
          <p class="legal-text mb-1">
            &copy; 2026 Cognizant Technology Solutions. All rights reserved.
          </p>
          <div class="legal-links">
            <span class="legal-item">Internal Operations</span>
            <span class="legal-dot">&bull;</span>
            <span class="legal-item">Security Standards</span>
            <span class="legal-dot">&bull;</span>
            <span class="legal-item">Academy Support</span>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ==========================================================================
       VIEWPORT & AMBIENT BACKDROP
       ========================================================================== */
    .auth-viewport {
      min-height: 100vh;
      width: 100vw;
      background-color: #040816;
      background-image: 
        radial-gradient(circle at 50% 0%, #0d1b3e 0%, #040816 75%);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.25rem;
      overflow-x: hidden;
      font-family: inherit;
    }

    /* Ambient soft luminous orbs */
    .ambient-glow {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(100px);
      z-index: 0;
    }

    .glow-1 {
      top: 10%;
      left: 20%;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(0, 102, 245, 0.22) 0%, transparent 70%);
      animation: floatSlow 12s ease-in-out infinite alternate;
    }

    .glow-2 {
      bottom: 10%;
      right: 20%;
      width: 520px;
      height: 520px;
      background: radial-gradient(circle, rgba(0, 210, 255, 0.16) 0%, transparent 70%);
      animation: floatSlow 14s ease-in-out infinite alternate-reverse;
    }

    @keyframes floatSlow {
      0% { transform: translateY(0) scale(1); }
      100% { transform: translateY(-30px) scale(1.05); }
    }

    /* Subtle geometric grid texture */
    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 36px 36px;
      pointer-events: none;
      z-index: 0;
    }

    /* ==========================================================================
       CONTAINER & BRANDING HEADER
       ========================================================================== */
    .auth-container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 460px;
      margin: 0 auto;
      animation: cardEntrance 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes cardEntrance {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.985);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .brand-badge-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 0.85rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 0.5rem 1.15rem 0.5rem 0.65rem;
      border-radius: 999px;
      backdrop-filter: blur(12px);
    }

    .brand-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00d2ff 0%, #0066f5 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      box-shadow: 0 4px 12px rgba(0, 102, 245, 0.4);
    }

    .brand-text {
      text-align: left;
      line-height: 1.15;
    }

    .brand-title {
      display: block;
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #ffffff;
    }

    .brand-division {
      display: block;
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #38bdf8;
    }

    .brand-tagline {
      font-size: 0.875rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.4;
    }

    /* ==========================================================================
       AUTHENTICATION CARD
       ========================================================================== */
    .auth-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      box-shadow: 
        0 20px 40px -15px rgba(0, 0, 40, 0.3),
        0 0 0 1px rgba(0, 0, 0, 0.04);
      padding: 2.25rem;
      overflow: hidden;
    }

    .card-header-section {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .card-title {
      font-size: 1.45rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #0f172a;
      margin-bottom: 0.25rem;
    }

    .card-subtitle {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0 0 1.25rem 0;
    }

    /* Segmented Persona Selector */
    .role-selector-pills {
      display: flex;
      background-color: #f1f5f9;
      padding: 0.25rem;
      border-radius: 12px;
      gap: 0.25rem;
    }

    .role-pill {
      flex: 1;
      border: none;
      background: transparent;
      padding: 0.5rem 0.65rem;
      border-radius: 9px;
      font-size: 0.825rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }

    .role-pill:hover:not(.active) {
      color: #1e293b;
      background: rgba(255, 255, 255, 0.5);
    }

    .role-pill.active {
      background: #ffffff;
      color: #004ecc;
      box-shadow: 0 2px 8px rgba(0, 0, 40, 0.08);
      font-weight: 700;
    }

    /* ==========================================================================
       FORM CONTROLS & INPUTS
       ========================================================================== */
    .auth-form {
      margin-bottom: 1.25rem;
    }

    .form-group .form-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.815rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.4rem;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      color: #94a3b8;
      font-size: 1.05rem;
      pointer-events: none;
      transition: color 0.15s ease;
    }

    .form-input {
      width: 100%;
      height: 46px;
      padding: 0 2.5rem 0 2.75rem;
      font-size: 0.925rem;
      color: #0f172a;
      background-color: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 11px;
      transition: all 0.2s ease;
      outline: none;
    }

    .form-input:focus {
      background-color: #ffffff;
      border-color: #0066f5;
      box-shadow: 0 0 0 3.5px rgba(0, 102, 245, 0.12);
    }

    .form-input:focus + .input-icon,
    .input-wrapper:focus-within .input-icon {
      color: #0066f5;
    }

    .input-action-btn {
      position: absolute;
      right: 0.75rem;
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 1.05rem;
      padding: 0.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: color 0.15s ease;
    }

    .input-action-btn:hover {
      color: #334155;
    }

    .btn-forgot-link {
      border: none;
      background: transparent;
      font-size: 0.75rem;
      font-weight: 600;
      color: #0066f5;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .btn-forgot-link:hover {
      color: #004ecc;
      text-decoration: underline;
    }

    /* Checkbox & Session indicator */
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.815rem;
      color: #64748b;
      cursor: pointer;
      user-select: none;
      margin: 0;
    }

    .custom-checkbox {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: 1.5px solid #cbd5e1;
      cursor: pointer;
      accent-color: #0066f5;
    }

    .session-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.725rem;
      color: #64748b;
      font-weight: 500;
    }

    .status-indicator {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #10b981;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
    }

    /* Error alert */
    .error-banner {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      padding: 0.65rem 0.85rem;
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      color: #b91c1c;
      font-size: 0.815rem;
      line-height: 1.4;
      animation: alertIn 0.2s ease;
    }

    @keyframes alertIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Submit Button */
    .btn-submit {
      width: 100%;
      height: 48px;
      background: linear-gradient(135deg, #000038 0%, #004ecc 100%);
      color: #ffffff;
      border: none;
      border-radius: 11px;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0, 78, 204, 0.28);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-submit:hover:not(:disabled) {
      background: linear-gradient(135deg, #000048 0%, #003ca0 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0, 78, 204, 0.38);
    }

    .btn-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    /* Divider */
    .auth-divider {
      position: relative;
      text-align: center;
    }

    .auth-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #f1f5f9;
    }

    .auth-divider span {
      position: relative;
      background-color: #ffffff;
      padding: 0 0.75rem;
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* SSO Button */
    .btn-sso {
      width: 100%;
      height: 44px;
      background-color: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 11px;
      color: #334155;
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-sso:hover:not(:disabled) {
      background-color: #f1f5f9;
      border-color: #cbd5e1;
      color: #0f172a;
    }

    /* Security badge at bottom of card */
    .card-security-footer {
      border-top: 1px solid #f1f5f9;
      padding-top: 1rem;
      margin-top: 0.75rem;
      font-size: 0.725rem;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    /* ==========================================================================
       GLOBAL LEGAL & AUDIT FOOTER
       ========================================================================== */
    .auth-global-footer {
      color: #64748b;
      font-size: 0.775rem;
    }

    .legal-text {
      color: #64748b;
    }

    .legal-links {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: #64748b;
    }

    .legal-dot {
      opacity: 0.5;
    }

    .legal-item {
      font-size: 0.725rem;
    }

    /* ==========================================================================
       RESPONSIVE BREAKPOINTS
       ========================================================================== */
    @media (max-width: 575.98px) {
      .auth-viewport {
        padding: 1.25rem 1rem;
      }

      .auth-card {
        padding: 1.5rem 1.25rem;
        border-radius: 16px;
      }

      .card-title {
        font-size: 1.3rem;
      }

      .role-pill {
        padding: 0.45rem 0.4rem;
        font-size: 0.775rem;
      }

      .form-input {
        height: 44px;
        font-size: 0.885rem;
      }

      .btn-submit {
        height: 46px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  selectedRole: UserRole = 'COACH';
  loginId: string = 'coach01';
  password: string = 'coach123';
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

  switchRole(role: UserRole): void {
    this.selectedRole = role;
    this.errorMessage = '';
    if (role === 'COACH') {
      this.loginId = 'coach01';
      this.password = 'coach123';
    } else if (role === 'TRAINER') {
      this.loginId = 'trainer01';
      this.password = 'trainer123';
    } else if (role === 'ADMIN') {
      this.loginId = 'admin01';
      this.password = 'admin123';
    }
  }

  fillDefaultPassword(): void {
    if (this.selectedRole === 'COACH') {
      this.password = 'coach123';
    } else if (this.selectedRole === 'TRAINER') {
      this.password = 'trainer123';
    } else if (this.selectedRole === 'ADMIN') {
      this.password = 'admin123';
    }
    this.errorMessage = '';
  }

  getRoleDisplayName(): string {
    switch (this.selectedRole) {
      case 'COACH': return 'Coach';
      case 'TRAINER': return 'Trainer';
      case 'ADMIN': return 'Administrator';
    }
  }

  getRoleEmailHint(): string {
    switch (this.selectedRole) {
      case 'COACH': return '(e.g. coach01@cognizant.com)';
      case 'TRAINER': return '(e.g. trainer01@cognizant.com)';
      case 'ADMIN': return '(e.g. admin01@cognizant.com)';
    }
  }

  onLogin(): void {
    if (!this.loginId || !this.password) {
      this.errorMessage = 'Please provide both your Associate ID / email and password.';
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

  onSsoLogin(): void {
    // Enterprise SSO simulated fast-path using active persona
    this.onLogin();
  }
}
