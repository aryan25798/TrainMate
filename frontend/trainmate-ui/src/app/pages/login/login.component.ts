import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      
      <!-- DESKTOP SPLIT / MOBILE CONTAINER -->
      <div class="login-container-inner">
        
        <!-- LEFT PANEL: Enterprise Brand Showcase (Visible on >= 992px) -->
        <aside class="brand-showcase d-none d-lg-flex" aria-label="Platform Highlights">
          <div class="showcase-content">
            <!-- Brand Badge -->
            <div class="showcase-header">
              <div class="brand-mark">
                <i class="bi bi-mortarboard-fill"></i>
              </div>
              <div class="brand-text">
                <span class="brand-title">TRAINMATE</span>
                <span class="brand-badge">Cognizant Academy</span>
              </div>
            </div>

            <!-- Value Proposition -->
            <div class="showcase-hero">
              <div class="hero-chip">
                <span class="pulse-dot"></span>
                <span>Enterprise Resource Allocation</span>
              </div>
              <h1 class="hero-heading">
                Intelligent Cohort Orchestration & Trainer Allocation
              </h1>
              <p class="hero-desc">
                Autonomous 100-point multi-criteria matching engine optimizing trainer availability, skill proficiency, and workload balance across global academy streams.
              </p>

              <!-- Platform Features List -->
              <div class="feature-list">
                <div class="feature-item">
                  <div class="feature-icon blue">
                    <i class="bi bi-cpu-fill"></i>
                  </div>
                  <div>
                    <div class="feature-title">100-Point Algorithmic Matching</div>
                    <div class="feature-desc">Dynamic scoring across primary skills, workload headroom, and seniority tiers.</div>
                  </div>
                </div>

                <div class="feature-item">
                  <div class="feature-icon green">
                    <i class="bi bi-shield-check"></i>
                  </div>
                  <div>
                    <div class="feature-title">Conflict-Free Scheduling</div>
                    <div class="feature-desc">Automated validation preventing cohort schedule collisions and trainer over-commitment.</div>
                  </div>
                </div>

                <div class="feature-item">
                  <div class="feature-icon purple">
                    <i class="bi bi-file-earmark-bar-graph-fill"></i>
                  </div>
                  <div>
                    <div class="feature-title">Executive Auditing &amp; Exports</div>
                    <div class="feature-desc">Instant multi-service line Excel reporting, CSV exports, and workload analytics.</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Showcase Footer -->
            <div class="showcase-footer">
              <div class="system-status">
                <span class="status-indicator"></span>
                <span>Academy Core Systems &bull; 100% Operational</span>
              </div>
              <div class="security-badge">
                <i class="bi bi-lock-fill me-1"></i> 256-bit TLS Encrypted
              </div>
            </div>
          </div>
        </aside>

        <!-- RIGHT PANEL: Authentication Form Hub -->
        <main class="auth-hub" role="main">
          <div class="auth-card">
            
            <!-- Mobile Brand Header (Visible only on < 992px) -->
            <div class="mobile-brand d-lg-none">
              <div class="brand-mark mb-2">
                <i class="bi bi-mortarboard-fill"></i>
              </div>
              <h2 class="mobile-brand-title mb-0">TRAINMATE</h2>
              <span class="mobile-brand-sub">Cognizant Academy Portal</span>
            </div>

            <!-- Header Titles -->
            <div class="auth-header">
              <h2 class="auth-title">Sign in to your account</h2>
              <p class="auth-subtitle">
                Enter your Cognizant Associate credentials or select a test role below.
              </p>
            </div>

            <!-- Interactive Quick Role Persona Selector -->
            <div class="role-selector-section mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1.5">
                <span class="role-selector-label">
                  <i class="bi bi-person-workspace text-primary me-1"></i> Quick Test Persona:
                </span>
                <span class="badge bg-light text-muted border px-2 py-0.5" style="font-size: 0.685rem;">
                  One-Click Fill
                </span>
              </div>
              <div class="role-pills-grid" role="group" aria-label="Select test account persona">
                <button
                  type="button"
                  class="role-pill-btn"
                  [class.active]="selectedRole === 'coach'"
                  (click)="selectPersona('coach', 'coach01', 'coach123')"
                  title="Test as Delivery Coach">
                  <div class="role-pill-icon"><i class="bi bi-briefcase-fill"></i></div>
                  <div class="role-pill-text">
                    <span class="role-name">Coach</span>
                    <span class="role-id">coach01</span>
                  </div>
                  <i *ngIf="selectedRole === 'coach'" class="bi bi-check-circle-fill active-check"></i>
                </button>

                <button
                  type="button"
                  class="role-pill-btn"
                  [class.active]="selectedRole === 'trainer'"
                  (click)="selectPersona('trainer', 'trainer01', 'trainer123')"
                  title="Test as SME Trainer">
                  <div class="role-pill-icon"><i class="bi bi-mortarboard-fill"></i></div>
                  <div class="role-pill-text">
                    <span class="role-name">Trainer</span>
                    <span class="role-id">trainer01</span>
                  </div>
                  <i *ngIf="selectedRole === 'trainer'" class="bi bi-check-circle-fill active-check"></i>
                </button>

                <button
                  type="button"
                  class="role-pill-btn"
                  [class.active]="selectedRole === 'admin'"
                  (click)="selectPersona('admin', 'admin01', 'admin123')"
                  title="Test as Academy Admin">
                  <div class="role-pill-icon"><i class="bi bi-shield-shaded"></i></div>
                  <div class="role-pill-text">
                    <span class="role-name">Admin</span>
                    <span class="role-id">admin01</span>
                  </div>
                  <i *ngIf="selectedRole === 'admin'" class="bi bi-check-circle-fill active-check"></i>
                </button>
              </div>
            </div>

            <!-- Dynamic Alert Notifications -->
            <div
              *ngIf="errorMessage"
              class="auth-alert alert-danger"
              role="alert"
              aria-live="assertive">
              <i class="bi bi-exclamation-triangle-fill flex-shrink-0 fs-6"></i>
              <div class="flex-grow-1">{{ errorMessage }}</div>
              <button
                type="button"
                class="btn-close-alert"
                (click)="errorMessage = ''"
                aria-label="Dismiss error">
                &times;
              </button>
            </div>

            <div
              *ngIf="infoMessage"
              class="auth-alert alert-info"
              role="status"
              aria-live="polite">
              <i class="bi bi-info-circle-fill flex-shrink-0 fs-6"></i>
              <div class="flex-grow-1">{{ infoMessage }}</div>
              <button
                type="button"
                class="btn-close-alert"
                (click)="infoMessage = ''"
                aria-label="Dismiss alert">
                &times;
              </button>
            </div>

            <!-- Sign In Form -->
            <form (ngSubmit)="onLogin()" autocomplete="on" novalidate>
              
              <!-- Associate ID or Email Input -->
              <div class="form-group mb-3">
                <label for="loginId" class="form-label-custom">
                  Associate ID or Corporate Email
                </label>
                <div class="input-icon-wrap" [class.has-error]="errorMessage && !loginId">
                  <i class="bi bi-person-badge input-leading-icon" aria-hidden="true"></i>
                  <input
                    id="loginId"
                    type="text"
                    class="form-input-custom"
                    placeholder="e.g. coach01 or name@cognizant.com"
                    [(ngModel)]="loginId"
                    (input)="onInputChange()"
                    name="loginId"
                    autocomplete="username"
                    required
                    autofocus
                    aria-required="true"
                  />
                  <button
                    *ngIf="loginId"
                    type="button"
                    class="clear-input-btn"
                    (click)="clearLoginId()"
                    tabindex="-1"
                    aria-label="Clear ID">
                    <i class="bi bi-x-circle-fill"></i>
                  </button>
                </div>
              </div>

              <!-- Password Input -->
              <div class="form-group mb-2">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label for="password" class="form-label-custom mb-0">Password</label>
                  <button
                    type="button"
                    class="btn-link-action"
                    (click)="showHelpModal = true">
                    Forgot password?
                  </button>
                </div>
                <div class="input-icon-wrap" [class.has-error]="errorMessage && !password">
                  <i class="bi bi-lock-fill input-leading-icon" aria-hidden="true"></i>
                  <input
                    id="password"
                    [type]="showPassword ? 'text' : 'password'"
                    class="form-input-custom"
                    placeholder="Enter your password"
                    [(ngModel)]="password"
                    (input)="onInputChange()"
                    (keydown)="checkCapsLock($event)"
                    (keyup)="checkCapsLock($event)"
                    name="password"
                    autocomplete="current-password"
                    required
                    aria-required="true"
                  />
                  <button
                    type="button"
                    class="toggle-password-btn"
                    (click)="showPassword = !showPassword"
                    tabindex="-1"
                    [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
                    [title]="showPassword ? 'Hide password' : 'Show password'">
                    <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                  </button>
                </div>

                <!-- Caps Lock Warning -->
                <div *ngIf="isCapsLockOn" class="caps-warning-pill mt-1" role="status">
                  <i class="bi bi-arrow-up-square-fill text-warning me-1"></i>
                  <span>Caps Lock is ON</span>
                </div>
              </div>

              <!-- Remember Me & Help -->
              <div class="d-flex justify-content-between align-items-center mt-3 mb-3.5">
                <label class="remember-checkbox-label">
                  <input
                    type="checkbox"
                    [(ngModel)]="rememberMe"
                    name="rememberMe"
                  />
                  <span class="custom-check-box"></span>
                  <span class="remember-text">Remember Associate ID</span>
                </label>

                <button
                  type="button"
                  class="btn-link-action small"
                  (click)="showHelpModal = true">
                  <i class="bi bi-question-circle me-1"></i>Help
                </button>
              </div>

              <!-- Primary Submit Button -->
              <button
                type="submit"
                class="btn-primary-auth"
                [disabled]="loading"
                [attr.aria-busy]="loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span>{{ loading ? 'Authenticating...' : 'Sign In to Portal' }}</span>
                <i *ngIf="!loading" class="bi bi-arrow-right-short fs-5 ms-1"></i>
              </button>

              <!-- Corporate SSO Divider -->
              <div class="auth-divider">
                <span>or continue with</span>
              </div>

              <!-- SSO Corporate Sign In -->
              <button
                type="button"
                class="btn-sso-auth"
                (click)="onSsoLogin()"
                [disabled]="loading"
                title="Single Sign-On through Cognizant OneSpace">
                <i class="bi bi-shield-lock-fill text-primary fs-6 me-2"></i>
                <span>Sign in with Cognizant SSO</span>
              </button>
            </form>

            <!-- Card Bottom Note -->
            <div class="auth-footer-note">
              <span>Restricted System &bull; Authorized Cognizant Associates Only</span>
            </div>
          </div>

          <!-- Bottom Footer Links -->
          <footer class="login-page-footer">
            <span>&copy; 2026 Cognizant Academy Operations</span>
            <span class="footer-separator">&bull;</span>
            <button type="button" class="footer-link-btn" (click)="showHelpModal = true">IT Service Desk</button>
            <span class="footer-separator">&bull;</span>
            <span class="text-muted">Privacy &amp; Security Policy</span>
          </footer>
        </main>
      </div>

      <!-- IT Help & Credentials Modal -->
      <div class="auth-modal-backdrop" *ngIf="showHelpModal" (click)="showHelpModal = false">
        <div class="auth-modal-dialog" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="helpTitle">
          <div class="auth-modal-header">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-headset text-primary fs-5"></i>
              <h5 class="mb-0 fw-bold text-dark" id="helpTitle">Cognizant Academy IT Support</h5>
            </div>
            <button type="button" class="btn-close" (click)="showHelpModal = false" aria-label="Close"></button>
          </div>

          <div class="auth-modal-body">
            <p class="small text-secondary mb-3">
              TrainMate is the core cohort allocation portal for Cognizant Academy. If you are experiencing access or authentication issues, please refer to the support channels below:
            </p>

            <!-- Support Details Card -->
            <div class="support-card mb-3">
              <div class="support-item">
                <i class="bi bi-envelope-fill text-primary"></i>
                <div>
                  <div class="fw-semibold text-dark small">OneSpace Service Desk</div>
                  <a href="mailto:academy.support@cognizant.com" class="small text-decoration-none">academy.support&#64;cognizant.com</a>
                </div>
              </div>

              <div class="support-item">
                <i class="bi bi-telephone-fill text-success"></i>
                <div>
                  <div class="fw-semibold text-dark small">Internal IT Hotline</div>
                  <span class="small text-muted">+1 (800) 555-CTSH (Ext: 44321)</span>
                </div>
              </div>

              <div class="support-item">
                <i class="bi bi-ticket-detailed-fill text-purple"></i>
                <div>
                  <div class="fw-semibold text-dark small">Self-Service Ticket</div>
                  <span class="small text-muted">Submit an incident under Category: Academy Systems / TrainMate</span>
                </div>
              </div>
            </div>

            <!-- Demo Default Credentials Quick Reference -->
            <div class="p-3 bg-light rounded-3 border">
              <h6 class="fw-bold small text-dark mb-2">Default Pre-Configured Test Credentials:</h6>
              <ul class="list-unstyled small mb-0 text-secondary">
                <li class="mb-1"><span class="badge bg-primary-subtle text-primary border border-primary-subtle me-1.5">Coach</span> <code>coach01</code> / <code>coach123</code></li>
                <li class="mb-1"><span class="badge bg-success-subtle text-success border border-success-subtle me-1.5">Trainer</span> <code>trainer01</code> / <code>trainer123</code></li>
                <li><span class="badge bg-dark-subtle text-dark border me-1.5">Admin</span> <code>admin01</code> / <code>admin123</code></li>
              </ul>
            </div>
          </div>

          <div class="auth-modal-footer">
            <button type="button" class="btn btn-secondary-custom w-100" (click)="showHelpModal = false">
              Understood, Return to Sign In
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      min-height: 100dvh;
    }

    .login-wrapper {
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      display: flex;
      flex-direction: column;
      background-color: #f8fafc;
      font-family: var(--font-family, 'Plus Jakarta Sans', system-ui, sans-serif);
      overflow-x: hidden;
    }

    .login-container-inner {
      display: flex;
      flex: 1 1 auto;
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
    }

    /* LEFT BRAND SHOWCASE (>= 992px) */
    .brand-showcase {
      flex: 0 0 44%;
      max-width: 540px;
      min-width: 400px;
      background: linear-gradient(155deg, #000038 0%, #070c24 55%, #001b54 100%);
      color: #ffffff;
      padding: 3.5rem 3rem;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 6px 0 25px rgba(0, 0, 56, 0.15);
    }

    /* Subtle geometric ambient backdrop glow */
    .brand-showcase::before {
      content: '';
      position: absolute;
      top: -20%;
      right: -20%;
      width: 480px;
      height: 480px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 102, 245, 0.22) 0%, rgba(0, 210, 255, 0.05) 50%, transparent 70%);
      pointer-events: none;
    }

    .brand-showcase::after {
      content: '';
      position: absolute;
      bottom: -10%;
      left: -10%;
      width: 360px;
      height: 360px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 210, 255, 0.15) 0%, transparent 65%);
      pointer-events: none;
    }

    .showcase-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }

    .showcase-header {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .brand-mark {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0066f5 0%, #00d2ff 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      box-shadow: 0 4px 14px rgba(0, 102, 245, 0.4);
      flex-shrink: 0;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #ffffff;
      line-height: 1.1;
    }

    .brand-badge {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #38bdf8;
    }

    .showcase-hero {
      margin: 2.5rem 0;
    }

    .hero-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0, 102, 245, 0.15);
      border: 1px solid rgba(0, 102, 245, 0.35);
      padding: 0.3rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #93c5fd;
      margin-bottom: 1.25rem;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #38bdf8;
      box-shadow: 0 0 8px #38bdf8;
      animation: pulseAnimation 2s infinite;
    }

    @keyframes pulseAnimation {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.8; }
    }

    .hero-heading {
      font-size: 1.85rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.25;
      letter-spacing: -0.03em;
      margin-bottom: 1rem;
    }

    .hero-desc {
      font-size: 0.95rem;
      color: #cbd5e1;
      line-height: 1.55;
      margin-bottom: 2rem;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
    }

    .feature-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.05rem;
      flex-shrink: 0;
    }

    .feature-icon.blue { background: rgba(0, 102, 245, 0.2); color: #60a5fa; }
    .feature-icon.green { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .feature-icon.purple { background: rgba(139, 92, 246, 0.2); color: #c084fc; }

    .feature-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 0.15rem;
    }

    .feature-desc {
      font-size: 0.785rem;
      color: #94a3b8;
      line-height: 1.4;
    }

    .showcase-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .system-status {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .status-indicator {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }

    .security-badge {
      display: flex;
      align-items: center;
      color: #cbd5e1;
    }

    /* RIGHT AUTH HUB */
    .auth-hub {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2.5rem 1.5rem;
      background: radial-gradient(circle at 50% 0%, #ffffff 0%, #f8fafc 100%);
      min-width: 0;
    }

    .auth-card {
      width: 100%;
      max-width: 450px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 2.5rem 2.25rem;
      box-shadow: 
        0 1px 3px rgba(0, 0, 0, 0.02),
        0 12px 30px -10px rgba(0, 20, 60, 0.07);
      animation: fadeInCard 0.22s ease-out;
      position: relative;
    }

    @keyframes fadeInCard {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Mobile Brand Header */
    .mobile-brand {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .mobile-brand .brand-mark {
      margin: 0 auto;
    }

    .mobile-brand-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #000038;
      letter-spacing: -0.02em;
    }

    .mobile-brand-sub {
      font-size: 0.75rem;
      font-weight: 700;
      color: #0066f5;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .auth-header {
      margin-bottom: 1.35rem;
    }

    .auth-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.025em;
      margin-bottom: 0.35rem;
    }

    .auth-subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
      line-height: 1.45;
    }

    /* Role Selector Pills */
    .role-selector-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.75rem 0.85rem;
    }

    .role-selector-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .role-pills-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .role-pill-btn {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.45rem 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
      transition: all 0.16s ease;
      position: relative;
      text-align: left;
    }

    .role-pill-btn:hover {
      border-color: #cbd5e1;
      background: #f1f5f9;
      transform: translateY(-1px);
    }

    .role-pill-btn.active {
      border-color: #0066f5;
      background: #eff6ff;
      box-shadow: 0 2px 6px rgba(0, 102, 245, 0.15);
    }

    .role-pill-icon {
      font-size: 0.95rem;
      color: #64748b;
      flex-shrink: 0;
    }

    .role-pill-btn.active .role-pill-icon {
      color: #0066f5;
    }

    .role-pill-text {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      line-height: 1.1;
    }

    .role-name {
      font-size: 0.785rem;
      font-weight: 700;
      color: #1e293b;
    }

    .role-id {
      font-size: 0.65rem;
      color: #64748b;
      font-family: monospace;
    }

    .active-check {
      position: absolute;
      top: 3px;
      right: 4px;
      font-size: 0.65rem;
      color: #0066f5;
    }

    /* Alerts */
    .auth-alert {
      border-radius: 8px;
      padding: 0.65rem 0.85rem;
      font-size: 0.8125rem;
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      margin-bottom: 1.15rem;
      line-height: 1.4;
      animation: fadeInAlert 0.15s ease;
    }

    @keyframes fadeInAlert {
      from { opacity: 0; transform: translateY(-3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .alert-danger {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
    }

    .alert-info {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
    }

    .btn-close-alert {
      background: transparent;
      border: none;
      font-size: 1.15rem;
      line-height: 1;
      color: inherit;
      opacity: 0.6;
      cursor: pointer;
      padding: 0;
    }

    .btn-close-alert:hover {
      opacity: 1;
    }

    /* Form Fields */
    .form-label-custom {
      font-size: 0.8125rem;
      font-weight: 700;
      color: #334155;
      display: block;
      margin-bottom: 0.35rem;
      letter-spacing: -0.01em;
    }

    .input-icon-wrap {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .input-leading-icon {
      position: absolute;
      left: 0.85rem;
      color: #94a3b8;
      font-size: 1.05rem;
      pointer-events: none;
      transition: color 0.15s ease;
    }

    .form-input-custom {
      width: 100%;
      height: 44px;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 0 2.4rem 0 2.5rem;
      font-size: 0.925rem;
      color: #0f172a;
      background: #ffffff;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .form-input-custom:focus {
      border-color: #0066f5;
      box-shadow: 0 0 0 3px rgba(0, 102, 245, 0.15);
    }

    .form-input-custom:focus + .input-leading-icon,
    .input-icon-wrap:focus-within .input-leading-icon {
      color: #0066f5;
    }

    .input-icon-wrap.has-error .form-input-custom {
      border-color: #ef4444;
      background-color: #fffbfb;
    }

    .clear-input-btn,
    .toggle-password-btn {
      position: absolute;
      right: 0.65rem;
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 1.05rem;
      padding: 0.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease;
    }

    .clear-input-btn:hover,
    .toggle-password-btn:hover {
      color: #334155;
    }

    /* Caps Lock Warning Pill */
    .caps-warning-pill {
      font-size: 0.725rem;
      font-weight: 600;
      color: #b45309;
      background: #fffbeb;
      border: 1px solid #fde68a;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
    }

    /* Checkbox & Links */
    .remember-checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      cursor: pointer;
      user-select: none;
      margin: 0;
    }

    .remember-checkbox-label input {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      accent-color: #0066f5;
      cursor: pointer;
    }

    .remember-text {
      font-size: 0.8125rem;
      color: #475569;
      font-weight: 500;
    }

    .btn-link-action {
      background: transparent;
      border: none;
      color: #0066f5;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .btn-link-action:hover {
      color: #004ecc;
      text-decoration: underline;
    }

    .btn-link-action.small {
      font-size: 0.785rem;
      color: #64748b;
    }

    .btn-link-action.small:hover {
      color: #0066f5;
    }

    /* Primary Auth Button */
    .btn-primary-auth {
      width: 100%;
      height: 44px;
      background: linear-gradient(135deg, #000038 0%, #001f54 100%);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 6px rgba(0, 0, 56, 0.15);
    }

    .btn-primary-auth:hover:not(:disabled) {
      background: linear-gradient(135deg, #001254 0%, #003380 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 56, 0.25);
    }

    .btn-primary-auth:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      transform: none;
    }

    /* Corporate Divider */
    .auth-divider {
      position: relative;
      text-align: center;
      margin: 1.25rem 0;
    }

    .auth-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #e2e8f0;
    }

    .auth-divider span {
      position: relative;
      background: #ffffff;
      padding: 0 0.65rem;
      font-size: 0.725rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    /* SSO Button */
    .btn-sso-auth {
      width: 100%;
      height: 42px;
      background: #ffffff;
      color: #334155;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.885rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.16s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }

    .btn-sso-auth:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #0f172a;
      transform: translateY(-1px);
    }

    .auth-footer-note {
      text-align: center;
      font-size: 0.7rem;
      color: #94a3b8;
      margin-top: 1.65rem;
      padding-top: 1.15rem;
      border-top: 1px solid #f1f5f9;
      letter-spacing: 0.02em;
    }

    /* Page Footer */
    .login-page-footer {
      margin-top: 2rem;
      font-size: 0.75rem;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .footer-separator {
      opacity: 0.5;
    }

    .footer-link-btn {
      border: none;
      background: transparent;
      color: #64748b;
      font-size: 0.75rem;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .footer-link-btn:hover {
      color: #0066f5;
      text-decoration: underline;
    }

    /* Support Modal Dialog */
    .auth-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(7, 12, 36, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1060;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeInModal 0.18s ease-out;
    }

    @keyframes fadeInModal {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .auth-modal-dialog {
      background: #ffffff;
      border-radius: 14px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 40px rgba(0, 0, 56, 0.2);
      overflow: hidden;
      animation: scaleUpModal 0.18s ease-out;
    }

    @keyframes scaleUpModal {
      from { transform: scale(0.96); }
      to { transform: scale(1); }
    }

    .auth-modal-header {
      padding: 1.15rem 1.35rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
    }

    .auth-modal-body {
      padding: 1.35rem;
    }

    .auth-modal-footer {
      padding: 1rem 1.35rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    .support-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .support-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .support-item i {
      font-size: 1.15rem;
      margin-top: 2px;
    }

    /* RESPONSIVE BREAKPOINTS */
    @media (max-width: 991.98px) {
      .auth-hub {
        padding: 2rem 1rem;
      }
      .auth-card {
        padding: 2rem 1.75rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      }
    }

    @media (max-width: 480px) {
      .auth-hub {
        padding: 1rem 0.75rem;
      }
      .auth-card {
        padding: 1.75rem 1.15rem;
        border-radius: 12px;
        box-shadow: none;
        border-color: #cbd5e1;
      }
      .role-pills-grid {
        grid-template-columns: 1fr;
        gap: 0.35rem;
      }
      .role-pill-btn {
        padding: 0.4rem 0.65rem;
      }
      .form-input-custom {
        font-size: 16px; /* Prevents auto-zoom on mobile iOS/Android browsers */
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginId: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  infoMessage: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = true;
  isCapsLockOn: boolean = false;
  selectedRole: string = '';
  showHelpModal: boolean = false;

  private readonly REMEMBERED_KEY = 'trainmate_remembered_id';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.redirectBasedOnRole();
      return;
    }

    // Retrieve saved ID if available
    try {
      const savedId = localStorage.getItem(this.REMEMBERED_KEY);
      if (savedId) {
        this.loginId = savedId;
        this.rememberMe = true;
      }
    } catch {
      // LocalStorage access safe guard
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showHelpModal) {
      this.showHelpModal = false;
    }
    if (this.errorMessage) {
      this.errorMessage = '';
    }
    if (this.infoMessage) {
      this.infoMessage = '';
    }
  }

  selectPersona(role: string, id: string, pass: string): void {
    this.selectedRole = role;
    this.loginId = id;
    this.password = pass;
    this.errorMessage = '';
    this.infoMessage = `Loaded ${role.toUpperCase()} test credentials (${id}). Press Sign In to continue.`;
  }

  onInputChange(): void {
    this.selectedRole = 'custom';
    if (this.errorMessage) {
      this.errorMessage = '';
    }
    if (this.infoMessage) {
      this.infoMessage = '';
    }
  }

  clearLoginId(): void {
    this.loginId = '';
    this.selectedRole = '';
    this.onInputChange();
  }

  checkCapsLock(event: KeyboardEvent): void {
    this.isCapsLockOn = event.getModifierState && event.getModifierState('CapsLock');
  }

  onLogin(): void {
    const trimmedId = (this.loginId || '').trim();
    if (!trimmedId || !this.password) {
      this.errorMessage = 'Please enter your Associate ID or email and password.';
      this.infoMessage = '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    // Handle remember me
    try {
      if (this.rememberMe) {
        localStorage.setItem(this.REMEMBERED_KEY, trimmedId);
      } else {
        localStorage.removeItem(this.REMEMBERED_KEY);
      }
    } catch {
      // LocalStorage safe guard
    }

    this.authService.login({
      loginId: trimmedId,
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
        this.errorMessage = err?.error?.message || 'Authentication service unreachable. Please verify credentials or connection.';
      }
    });
  }

  onSsoLogin(): void {
    // If fields are filled, perform immediate login, otherwise populate default coach and log in
    if (!this.loginId) {
      this.selectPersona('coach', 'coach01', 'coach123');
    }
    this.onLogin();
  }
}
