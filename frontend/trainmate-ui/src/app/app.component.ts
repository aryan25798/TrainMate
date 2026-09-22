import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ToastContainerComponent } from './shared/toast-container.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastContainerComponent],
  template: `
    <!-- Global Toast Notifications -->
    <app-toast-container></app-toast-container>

    <!-- If on Login page, show full-screen scroll container -->
    <div *ngIf="isAuthPage" class="login-container">
      <router-outlet></router-outlet>
    </div>

    <!-- If logged in on dashboard/app pages, show industry-grade enterprise shell -->
    <div *ngIf="!isAuthPage" class="enterprise-app">
      
      <!-- 1. FULL-WIDTH ENTERPRISE NAVBAR (Fixed at Top, 100vw) -->
      <header class="top-navbar">
        <!-- Left: Universal Hamburger Button & Brand Area -->
        <div class="d-flex align-items-center gap-2 gap-sm-3">
          <button
            type="button"
            class="navbar-hamburger-btn"
            (click)="toggleSidebar()"
            title="Toggle Navigation Menu">
            <i class="bi bi-list fs-4"></i>
          </button>

          <!-- Unified Brand Logo & Title -->
          <div class="d-flex align-items-center gap-2 brand-logo-area">
            <div class="brand-icon-box">
              <i class="bi bi-mortarboard-fill"></i>
            </div>
            <span class="brand-title">TRAINMATE</span>
            <span class="academy-chip d-none d-sm-inline-block">Cognizant Academy</span>
          </div>

          <span class="text-muted opacity-50 d-none d-lg-inline ms-1 me-1">|</span>
          <span class="text-secondary small fw-medium d-none d-lg-inline text-truncate" style="max-width: 320px;">
            Global Operations
          </span>
        </div>

        <!-- Right: Associate Profile & Quick Controls -->
        <div class="d-flex align-items-center gap-2 gap-md-3">
          <!-- Role Badge -->
          <span class="badge px-2.5 py-1.5 fw-semibold d-none d-sm-inline-block" [ngClass]="getRoleBadgeClass()">
            {{ currentUserRole }}
          </span>

          <!-- User Profile Chip -->
          <div class="user-profile-chip">
            <span class="user-avatar-chip">
              {{ getUserInitial() }}
            </span>
            <span class="fw-semibold text-dark small d-none d-md-inline">{{ currentUserName }}</span>
          </div>

          <!-- Internal Mailbox Icon -->
          <a [routerLink]="getMailRoute()" class="btn btn-sm btn-icon-mailbox" title="Internal Mailbox">
            <i class="bi bi-envelope fs-5"></i>
          </a>

          <!-- Sign Out Button -->
          <button class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1.5 px-2.5 px-sm-3 py-1" (click)="showLogoutConfirm = true" title="Sign Out">
            <i class="bi bi-box-arrow-right"></i>
            <span class="d-none d-sm-inline">Sign Out</span>
          </button>
        </div>
      </header>

      <!-- 2. APPLICATION BODY: SIDEBAR + MAIN CONTENT -->
      <div class="app-body">
        
        <!-- Mobile Backdrop Overlay -->
        <div class="mobile-backdrop" [class.show]="sidebarOpenMobile" (click)="sidebarOpenMobile = false"></div>

        <!-- Persistent Sidebar (Smooth Slide-Toggle) -->
        <aside
          class="app-sidebar"
          [class.desktop-collapsed]="sidebarClosedDesktop"
          [class.mobile-open]="sidebarOpenMobile">
          
          <!-- Associate Info Box in Sidebar -->
          <div class="sidebar-user-card" *ngIf="currentUserName">
            <div class="d-flex align-items-center gap-2.5">
              <div class="sidebar-user-avatar">
                {{ getUserInitial() }}
              </div>
              <div class="sidebar-user-details text-truncate">
                <div class="sidebar-user-name text-truncate">{{ currentUserName }}</div>
                <div class="sidebar-user-role">{{ currentUserRole }}</div>
              </div>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="sidebar-nav-container">
            <!-- COACH NAV -->
            <ng-container *ngIf="currentUserRole === 'COACH'">
              <a class="nav-item-link" routerLink="/coach/dashboard" routerLinkActive="active" (click)="onNavClick()">
                <i class="bi bi-grid-1x2-fill"></i>
                <span>Dashboard</span>
              </a>
              <a class="nav-item-link" routerLink="/coach/upload" routerLinkActive="active" (click)="onNavClick()">
                <i class="bi bi-plus-circle-fill"></i>
                <span>Add Cohort</span>
              </a>
              <a class="nav-item-link" routerLink="/coach/cohorts" routerLinkActive="active" (click)="onNavClick()">
                <i class="bi bi-collection-fill"></i>
                <span>My Cohorts</span>
              </a>
              <a class="nav-item-link" routerLink="/coach/mail" routerLinkActive="active" (click)="onNavClick()">
                <i class="bi bi-envelope-fill"></i>
                <span>Mailbox</span>
              </a>
            </ng-container>

            <!-- TRAINER NAV -->
            <ng-container *ngIf="currentUserRole === 'TRAINER'">
              <a class="nav-item-link" routerLink="/trainer/dashboard" routerLinkActive="active" (click)="onNavClick()">
                <i class="bi bi-grid-1x2-fill"></i>
                <span>Dashboard</span>
              </a>
              <a class="nav-item-link" routerLink="/trainer/cohorts" routerLinkActive="active" (click)="onNavClick()">
                <i class="bi bi-calendar-check-fill"></i>
                <span>My Cohorts</span>
              </a>
              <a class="nav-item-link" routerLink="/trainer/mail" routerLinkActive="active" (click)="onNavClick()">
                <i class="bi bi-envelope-fill"></i>
                <span>Mailbox</span>
              </a>
            </ng-container>

            <!-- ADMIN NAV -->
            <ng-container *ngIf="currentUserRole === 'ADMIN'">
              <a class="nav-item-link" routerLink="/admin/dashboard" routerLinkActive="active" (click)="onNavClick()">
                <i class="bi bi-grid-1x2-fill"></i>
                <span>Dashboard</span>
              </a>
              <a class="nav-item-link" routerLink="/admin/cohorts" routerLinkActive="active" (click)="onNavClick()">
                <i class="bi bi-diagram-3-fill"></i>
                <span>All Cohorts</span>
              </a>
              <a class="nav-item-link" routerLink="/admin/trainers" routerLinkActive="active" (click)="onNavClick()">
                <i class="bi bi-people-fill"></i>
                <span>Trainers Pool</span>
              </a>
              <a class="nav-item-link" routerLink="/admin/mail" routerLinkActive="active" (click)="onNavClick()">
                <i class="bi bi-envelope-fill"></i>
                <span>Mailbox</span>
              </a>
            </ng-container>
          </nav>

          <!-- Sidebar Footer with Sign Out -->
          <div class="sidebar-bottom-action">
            <button type="button" class="nav-item-link text-danger border-0 bg-transparent w-100" (click)="showLogoutConfirm = true">
              <i class="bi bi-box-arrow-right"></i>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        <!-- 3. MAIN INDEPENDENTLY SCROLLABLE CONTENT (Expands smoothly to 100% when sidebar is toggled) -->
        <main class="app-main-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Logout Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showLogoutConfirm" (click)="showLogoutConfirm = false">
        <div class="modal-card modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-body p-4 text-center">
            <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger mb-3" style="width: 52px; height: 52px; font-size: 22px;">
              <i class="bi bi-box-arrow-right"></i>
            </div>
            <h5 class="modal-title fw-bold text-dark mb-2">Confirm Sign Out</h5>
            <p class="text-muted small mb-4">Are you sure you want to end your current TrainMate session?</p>
            <div class="d-flex justify-content-center gap-2">
              <button type="button" class="btn btn-secondary-custom px-4" (click)="showLogoutConfirm = false">Cancel</button>
              <button type="button" class="btn btn-danger px-4" (click)="executeLogout()">Sign Out</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class AppComponent {
  isAuthPage: boolean = true;
  sidebarClosedDesktop: boolean = false;
  sidebarOpenMobile: boolean = false;
  showLogoutConfirm: boolean = false;
  currentUserRole: string = '';
  currentUserName: string = '';

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthPage = event.urlAfterRedirects.startsWith('/login') || event.url === '/';
      this.sidebarOpenMobile = false;
      this.syncUserInfo();
    });
  }

  toggleSidebar(): void {
    if (window.innerWidth < 992) {
      this.sidebarOpenMobile = !this.sidebarOpenMobile;
    } else {
      this.sidebarClosedDesktop = !this.sidebarClosedDesktop;
    }
  }

  onNavClick(): void {
    if (window.innerWidth < 992) {
      this.sidebarOpenMobile = false;
    }
  }

  syncUserInfo(): void {
    const user = this.authService.currentUserValue;
    this.currentUserRole = user?.role || '';
    this.currentUserName = user?.name || 'Associate';
  }

  getUserInitial(): string {
    if (!this.currentUserName) return 'U';
    return this.currentUserName.charAt(0).toUpperCase();
  }

  getRoleBadgeClass(): string {
    switch (this.currentUserRole) {
      case 'COACH': return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'TRAINER': return 'bg-success-subtle text-success border border-success-subtle';
      case 'ADMIN': return 'bg-dark text-white border border-dark';
      default: return 'bg-light text-dark border';
    }
  }

  getMailRoute(): string {
    switch (this.currentUserRole) {
      case 'COACH': return '/coach/mail';
      case 'TRAINER': return '/trainer/mail';
      case 'ADMIN': return '/admin/mail';
      default: return '/notifications';
    }
  }

  executeLogout(): void {
    this.showLogoutConfirm = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
