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
    <div class="login-wrapper">
      
      <!-- LEFT HERO PANEL (Desktop >= 992px) -->
      <aside class="hero-panel d-none d-lg-flex">
        <div class="hero-inner">
          
          <!-- Brand Mark -->
          <div class="hero-brand">
            <div class="brand-badge">
              <div class="brand-icon">
                <i class="bi bi-mortarboard-fill"></i>
              </div>
              <div class="brand-titles">
                <span class="brand-name">TRAINMATE</span>
                <span class="brand-org">Cognizant Academy</span>
              </div>
            </div>
            <span class="enterprise-tag">v2.4 Enterprise</span>
          </div>

          <!-- Hero Main Content -->
          <div class="hero-content">
            <div class="status-pill mb-3">
              <span class="pulse-dot"></span>
              <span>Academy Resource Gateway &bull; Active</span>
            </div>

            <h1 class="hero-title">
              Orchestrating Academy Excellence across Global Delivery.
            </h1>

            <p class="hero-desc">
              Automated cohort lifecycle management, multi-variable trainer suitability allocation,
              and real-time capacity balancing across enterprise training streams.
            </p>

            <!-- Operational Value Pillars -->
            <div class="hero-pillars">
              <div class="pillar-card">
                <div class="pillar-icon">
                  <i class="bi bi-cpu"></i>
                </div>
                <div class="pillar-text">
                  <div class="pillar-title">100-Point Allocation Matrix</div>
                  <div class="pillar-sub">Deterministic scoring on skills, availability, and active load</div>
                </div>
              </div>

              <div class="pillar-card">
                <div class="pillar-icon">
                  <i class="bi bi-file-earmark-excel"></i>
                </div>
                <div class="pillar-text">
                  <div class="pillar-title">Batch XLSX Cohort Ingestion</div>
                  <div class="pillar-sub">Instant parsing and validation with conflict notifications</div>
                </div>
              </div>

              <div class="pillar-card">
                <div class="pillar-icon">
                  <i class="bi bi-shield-check"></i>
                </div>
                <div class="pillar-text">
                  <div class="pillar-title">Role-Based Governance</div>
                  <div class="pillar-sub">Dedicated workspaces for Coaches, Trainers, and Operations Admins</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Hero Footer -->
          <div class="hero-footer">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-check-circle-fill text-info"></i>
              <span>Cognizant Digital Business & Technology</span>
            </div>
            <span>Secure 256-Bit TLS</span>
          </div>

        </div>
      </aside>

      <!-- RIGHT FORM PANEL (All Viewports) -->
      <main class="form-panel">
        
        <!-- Mobile Header (< 992px) -->
        <header class="mobile-header d-lg-none">
          <div class="d-flex align-items-center gap-2.5">
            <div class="brand-icon sm">
              <i class="bi bi-mortarboard-fill"></i>
            </div>
            <div>
              <span class="fw-bold text-dark d-block lh-1" style="font-size: 1.15rem; letter-spacing: 0.02em;">TRAINMATE</span>
              <span class="text-muted" style="font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">Cognizant Academy</span>
            </div>
          </div>
          <span class="badge bg-light text-primary border small fw-semibold px-2 py-1">Enterprise SSO</span>
        </header>

        <!-- Centered Sign-In Box -->
        <div class="form-container">
          
          <div class="form-intro">
            <h2 class="form-title">Associate Sign In</h2>
            <p class="form-subtitle">Enter your corporate credentials to access your Academy workspace.</p>
          </div>

          <!-- Error Alert Banner -->
          <div class="alert-error" *ngIf="errorMessage">
            <i class="bi bi-exclamation-circle-fill flex-shrink-0"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Main Authentication Form -->
          <form (ngSubmit)="onLogin()" autocomplete="on">
            
            <!-- Associate ID or Email Input -->
            <div class="field-group">
              <label class="field-label" for="userLoginId">Corporate Email or Associate ID</label>
              <div class="input-container">
                <i class="bi bi-person input-affix"></i>
                <input
                  id="userLoginId"
                  type="text"
                  class="field-input"
                  placeholder="e.g. coach01@cognizant.com or coach01"
                  [(ngModel)]="loginId"
                  name="loginId"
                  autocomplete="username"
                  required
                />
              </div>
            </div>

            <!-- Password Input -->
            <div class="field-group">
              <div class="d-flex justify-content-between align-items-center mb-1.5">
                <label class="field-label mb-0" for="userPassword">Password</label>
                <button
                  type="button"
                  class="text-link small"
                  (click)="showHelpModal = true"
                  tabindex="-1">
                  Need help?
                </button>
              </div>
              <div class="input-container">
                <i class="bi bi-shield-lock input-affix"></i>
                <input
                  id="userPassword"
                  [type]="showPassword ? 'text' : 'password'"
                  class="field-input with-action"
                  placeholder="Enter your password"
                  [(ngModel)]="password"
                  name="password"
                  autocomplete="current-password"
                  required
                />
                <button
                  type="button"
                  class="password-toggle"
                  (click)="showPassword = !showPassword"
                  tabindex="-1"
                  [title]="showPassword ? 'Hide password' : 'Show password'">
                  <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Options Row -->
            <div class="d-flex justify-content-between align-items-center mb-4">
              <label class="checkbox-container">
                <input
                  type="checkbox"
                  class="checkbox-input"
                  [(ngModel)]="rememberMe"
                  name="rememberMe"
                />
                <span class="checkbox-text">Keep me signed in</span>
              </label>
              <span class="tls-badge">
                <i class="bi bi-lock-fill text-success me-1"></i>
                TLS 1.3
              </span>
            </div>

            <!-- Primary Submit Button -->
            <button
              type="submit"
              class="btn-primary-auth"
              [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              <span *ngIf="!loading">Sign In to Workspace</span>
              <i *ngIf="!loading" class="bi bi-arrow-right ms-2"></i>
            </button>

            <!-- SSO Divider -->
            <div class="divider-row">
              <span>or</span>
            </div>

            <!-- SSO Fast-Path Button -->
            <button
              type="button"
              class="btn-sso-auth"
              (click)="onSsoLogin()"
              [disabled]="loading">
              <i class="bi bi-building-check me-2 text-primary"></i>
              <span>Sign In with Cognizant SSO</span>
            </button>
          </form>

          <!-- Discreet Evaluation Credentials Trigger -->
          <div class="eval-strip">
            <button
              type="button"
              class="eval-trigger-link"
              (click)="showEvalModal = true">
              <i class="bi bi-info-circle me-1 text-primary"></i>
              <span>Evaluation & Testing Credentials</span>
            </button>
          </div>

          <!-- Card Security Footer -->
          <footer class="form-footer">
            <p class="mb-1 text-muted small">
              Protected by Cognizant Enterprise Security Standards &bull; Authorized use only
            </p>
            <p class="mb-0 text-muted" style="font-size: 0.72rem; opacity: 0.85;">
              &copy; 2026 Cognizant Technology Solutions. All rights reserved.
            </p>
          </footer>

        </div>
      </main>

      <!-- EVALUATION CREDENTIALS MODAL -->
      <div class="modal-backdrop" *ngIf="showEvalModal" (click)="showEvalModal = false">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header-row">
            <div>
              <h5 class="modal-title mb-0">Evaluation Accounts</h5>
              <p class="text-muted small mb-0">Select an enterprise persona to pre-fill credentials for testing</p>
            </div>
            <button type="button" class="btn-close-modal" (click)="showEvalModal = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="modal-body-content">
            
            <!-- Coach Card -->
            <div class="account-card" (click)="applyAccount('coach01', 'coach123')">
              <div class="account-icon blue">
                <i class="bi bi-person-workspace"></i>
              </div>
              <div class="account-details">
                <div class="account-name">Coach Workspace</div>
                <div class="account-cred">ID: <code>coach01</code> &bull; Email: <code>coach01&#64;cognizant.com</code></div>
                <div class="account-role-desc">Upload cohorts via XLSX, view suitability matrix, manage schedules</div>
              </div>
              <button type="button" class="btn btn-sm btn-outline-primary select-btn">
                Select
              </button>
            </div>

            <!-- Trainer Card -->
            <div class="account-card" (click)="applyAccount('trainer01', 'trainer123')">
              <div class="account-icon green">
                <i class="bi bi-person-video3"></i>
              </div>
              <div class="account-details">
                <div class="account-name">Trainer Workspace</div>
                <div class="account-cred">ID: <code>trainer01</code> &bull; Email: <code>trainer01&#64;cognizant.com</code></div>
                <div class="account-role-desc">View assigned cohorts, syllabus details, and mailbox notifications</div>
              </div>
              <button type="button" class="btn btn-sm btn-outline-primary select-btn">
                Select
              </button>
            </div>

            <!-- Admin Card -->
            <div class="account-card" (click)="applyAccount('admin01', 'admin123')">
              <div class="account-icon purple">
                <i class="bi bi-shield-lock"></i>
              </div>
              <div class="account-details">
                <div class="account-name">Administrator Workspace</div>
                <div class="account-cred">ID: <code>admin01</code> &bull; Email: <code>admin01&#64;cognizant.com</code></div>
                <div class="account-role-desc">Manage trainer profiles, override cohort allocations, platform administration</div>
              </div>
              <button type="button" class="btn btn-sm btn-outline-primary select-btn">
                Select
              </button>
            </div>

          </div>

          <div class="modal-footer-row">
            <span class="text-muted small">Passwords are pre-set for demonstration purposes</span>
            <button type="button" class="btn btn-sm btn-secondary" (click)="showEvalModal = false">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- NEED HELP MODAL -->
      <div class="modal-backdrop" *ngIf="showHelpModal" (click)="showHelpModal = false">
        <div class="modal-box modal-box-sm" (click)="$event.stopPropagation()">
          <div class="modal-header-row">
            <h5 class="modal-title mb-0">Need Help Signing In?</h5>
            <button type="button" class="btn-close-modal" (click)="showHelpModal = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body-content py-3">
            <p class="text-secondary small mb-3">
              TrainMate is an internal workforce allocation portal for Cognizant Academy.
            </p>
            <ul class="text-secondary small ps-3 mb-3">
              <li class="mb-2"><strong>First time accessing?</strong> Your Associate ID is linked to your corporate LDAP / SSO directory.</li>
              <li class="mb-2"><strong>Password reset:</strong> Use your standard Cognizant OneSpace self-service password portal.</li>
              <li><strong>Technical assistance:</strong> Contact the Academy Operations team or submit an internal ticket via OneSpace IT Support.</li>
            </ul>
          </div>
          <div class="modal-footer-row">
            <button type="button" class="btn btn-sm btn-primary w-100" (click)="showHelpModal = false">
              Got it
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ==========================================================================
       CONTAINER & LAYOUT
       ========================================================================== */
    .login-wrapper {
      display: flex;
      min-height: 100vh;
      width: 100vw;
      background-color: #ffffff;
      font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
      overflow-x: hidden;
    }

    /* ==========================================================================
       LEFT HERO PANEL (Executive Cognizant Aesthetic)
       ========================================================================== */
    .hero-panel {
      flex: 1.15;
      background: linear-gradient(150deg, #000038 0%, #060c28 55%, #00164d 100%);
      color: #ffffff;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* Ambient lighting effects */
    .hero-panel::before {
      content: '';
      position: absolute;
      top: -150px;
      right: -150px;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 210, 255, 0.12) 0%, rgba(0, 102, 245, 0.04) 50%, transparent 70%);
      pointer-events: none;
    }

    .hero-panel::after {
      content: '';
      position: absolute;
      bottom: -150px;
      left: -150px;
      width: 550px;
      height: 550px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 102, 245, 0.18) 0%, rgba(0, 0, 56, 0.08) 60%, transparent 75%);
      pointer-events: none;
    }

    .hero-inner {
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 3.5rem 4rem;
      max-width: 680px;
    }

    .hero-brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-badge {
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }

    .brand-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #00d2ff 0%, #0066f5 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      box-shadow: 0 4px 14px rgba(0, 102, 245, 0.35);
      flex-shrink: 0;
    }

    .brand-icon.sm {
      width: 36px;
      height: 36px;
      font-size: 1.15rem;
      border-radius: 10px;
    }

    .brand-titles {
      line-height: 1.15;
    }

    .brand-name {
      display: block;
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: #ffffff;
    }

    .brand-org {
      display: block;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #38bdf8;
    }

    .enterprise-tag {
      font-size: 0.75rem;
      font-weight: 600;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 0.25rem 0.65rem;
      border-radius: 20px;
    }

    .hero-content {
      margin: auto 0;
      padding: 2rem 0;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0, 210, 255, 0.08);
      border: 1px solid rgba(0, 210, 255, 0.2);
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.775rem;
      font-weight: 600;
      color: #38bdf8;
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #38bdf8;
      box-shadow: 0 0 6px #38bdf8;
    }

    .hero-title {
      font-size: 2.15rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.25;
      color: #ffffff;
      margin-bottom: 1rem;
    }

    .hero-desc {
      font-size: 0.975rem;
      line-height: 1.6;
      color: #cbd5e1;
      margin-bottom: 2rem;
    }

    .hero-pillars {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .pillar-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.035);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0.85rem 1.15rem;
      backdrop-filter: blur(8px);
      transition: background 0.2s ease;
    }

    .pillar-card:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .pillar-icon {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      background: rgba(0, 102, 245, 0.25);
      color: #60a5fa;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      flex-shrink: 0;
    }

    .pillar-title {
      font-size: 0.885rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.1rem;
    }

    .pillar-sub {
      font-size: 0.775rem;
      color: #94a3b8;
    }

    .hero-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 1.25rem;
      font-size: 0.775rem;
      color: #94a3b8;
    }

    /* ==========================================================================
       RIGHT FORM PANEL (Clean, High-Trust Corporate Auth)
       ========================================================================== */
    .form-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2.5rem 1.5rem;
      background-color: #ffffff;
      position: relative;
    }

    .mobile-header {
      width: 100%;
      max-width: 420px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .form-container {
      width: 100%;
      max-width: 420px;
      margin: 0 auto;
    }

    .form-intro {
      margin-bottom: 1.75rem;
    }

    .form-title {
      font-size: 1.65rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #0f172a;
      margin-bottom: 0.35rem;
    }

    .form-subtitle {
      font-size: 0.885rem;
      color: #64748b;
      margin: 0;
      line-height: 1.45;
    }

    /* Alert Banner */
    .alert-error {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      padding: 0.75rem 1rem;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      color: #b91c1c;
      font-size: 0.825rem;
      line-height: 1.4;
      animation: alertFadeIn 0.2s ease;
    }

    @keyframes alertFadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Form Fields */
    .field-group {
      margin-bottom: 1.2rem;
    }

    .field-label {
      display: block;
      font-size: 0.825rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.4rem;
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-affix {
      position: absolute;
      left: 1rem;
      color: #94a3b8;
      font-size: 1.05rem;
      pointer-events: none;
      transition: color 0.15s ease;
    }

    .field-input {
      width: 100%;
      height: 46px;
      padding: 0 1rem 0 2.65rem;
      font-size: 0.925rem;
      color: #0f172a;
      background-color: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      transition: all 0.15s ease;
      outline: none;
    }

    .field-input.with-action {
      padding-right: 2.65rem;
    }

    .field-input:focus {
      background-color: #ffffff;
      border-color: #0066f5;
      box-shadow: 0 0 0 3.5px rgba(0, 102, 245, 0.12);
    }

    .input-container:focus-within .input-affix {
      color: #0066f5;
    }

    .password-toggle {
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

    .password-toggle:hover {
      color: #334155;
    }

    .text-link {
      border: none;
      background: transparent;
      color: #0066f5;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .text-link:hover {
      color: #004ecc;
      text-decoration: underline;
    }

    /* Checkbox & TLS */
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
      margin: 0;
    }

    .checkbox-input {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: 1.5px solid #cbd5e1;
      accent-color: #0066f5;
      cursor: pointer;
    }

    .checkbox-text {
      font-size: 0.815rem;
      color: #64748b;
    }

    .tls-badge {
      font-size: 0.725rem;
      color: #64748b;
      font-weight: 500;
    }

    /* Submit Button */
    .btn-primary-auth {
      width: 100%;
      height: 48px;
      background: linear-gradient(135deg, #000038 0%, #004ecc 100%);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0, 78, 204, 0.25);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-primary-auth:hover:not(:disabled) {
      background: linear-gradient(135deg, #000048 0%, #003ca0 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(0, 78, 204, 0.35);
    }

    .btn-primary-auth:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    /* Divider */
    .divider-row {
      position: relative;
      text-align: center;
      margin: 1.25rem 0;
    }

    .divider-row::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #e2e8f0;
    }

    .divider-row span {
      position: relative;
      background-color: #ffffff;
      padding: 0 0.75rem;
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* SSO Button */
    .btn-sso-auth {
      width: 100%;
      height: 44px;
      background-color: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      color: #334155;
      font-size: 0.885rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-sso-auth:hover:not(:disabled) {
      background-color: #f1f5f9;
      border-color: #cbd5e1;
      color: #0f172a;
    }

    /* Evaluation Trigger Link */
    .eval-strip {
      text-align: center;
      margin-top: 1.5rem;
    }

    .eval-trigger-link {
      border: none;
      background: transparent;
      color: #64748b;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      transition: all 0.15s ease;
    }

    .eval-trigger-link:hover {
      color: #0066f5;
      background-color: #f1f5f9;
    }

    /* Footer */
    .form-footer {
      margin-top: 2rem;
      text-align: center;
      border-top: 1px solid #f1f5f9;
      padding-top: 1.25rem;
    }

    /* ==========================================================================
       MODAL DIALOG (Evaluation Credentials & Help)
       ========================================================================== */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
      animation: fadeInModal 0.2s ease;
    }

    @keyframes fadeInModal {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-box {
      width: 100%;
      max-width: 520px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      animation: scaleUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-box-sm {
      max-width: 440px;
    }

    @keyframes scaleUpModal {
      from { transform: scale(0.96) translateY(8px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }

    .modal-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      background-color: #f8fafc;
    }

    .modal-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0f172a;
    }

    .btn-close-modal {
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 1.1rem;
      padding: 0.25rem;
      cursor: pointer;
      border-radius: 6px;
      transition: color 0.15s ease;
    }

    .btn-close-modal:hover {
      color: #0f172a;
    }

    .modal-body-content {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      max-height: 70vh;
      overflow-y: auto;
    }

    .account-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background-color: #ffffff;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .account-card:hover {
      background-color: #f8fafc;
      border-color: #0066f5;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 102, 245, 0.08);
    }

    .account-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .account-icon.blue { background-color: #eff6ff; color: #0066f5; }
    .account-icon.green { background-color: #f0fdf4; color: #16a34a; }
    .account-icon.purple { background-color: #faf5ff; color: #9333ea; }

    .account-details {
      flex: 1;
      min-width: 0;
    }

    .account-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.15rem;
    }

    .account-cred {
      font-size: 0.775rem;
      color: #64748b;
      margin-bottom: 0.2rem;
    }

    .account-cred code {
      color: #004ecc;
      background-color: #f1f5f9;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .account-role-desc {
      font-size: 0.725rem;
      color: #94a3b8;
      line-height: 1.3;
    }

    .select-btn {
      flex-shrink: 0;
    }

    .modal-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      background-color: #f8fafc;
    }

    /* ==========================================================================
       RESPONSIVE BREAKPOINTS
       ========================================================================== */
    @media (max-width: 991.98px) {
      .form-panel {
        min-height: 100vh;
        justify-content: flex-start;
        padding: 1.5rem 1.25rem 2rem 1.25rem;
      }

      .form-container {
        margin-top: auto;
        margin-bottom: auto;
      }
    }

    @media (max-width: 575.98px) {
      .form-panel {
        padding: 1rem 1rem 1.5rem 1rem;
      }

      .form-title {
        font-size: 1.45rem;
      }

      .field-input {
        height: 44px;
        font-size: 0.885rem;
      }

      .btn-primary-auth {
        height: 46px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginId: string = 'coach01';
  password: string = 'coach123';
  loading: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = true;
  showEvalModal: boolean = false;
  showHelpModal: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.redirectBasedOnRole();
    }
  }

  applyAccount(id: string, pass: string): void {
    this.loginId = id;
    this.password = pass;
    this.errorMessage = '';
    this.showEvalModal = false;
  }

  onLogin(): void {
    if (!this.loginId || !this.password) {
      this.errorMessage = 'Please provide both your Corporate Email / ID and password.';
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
    // Enterprise SSO simulated fast-path using active credentials
    this.onLogin();
  }
}
