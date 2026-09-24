import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ToastContainerComponent } from './shared/toast-container.component';
import { LoadingSpinnerComponent } from './shared/loading-spinner.component';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastContainerComponent, LoadingSpinnerComponent],
  template: `
    <!-- Global Toast Notifications -->
    <app-toast-container></app-toast-container>

    <!-- Global Loading Spinner -->
    <app-loading-spinner></app-loading-spinner>

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
            title="Toggle Navigation Menu"
            aria-label="Toggle navigation menu"
            aria-expanded="false"
            [attr.aria-expanded]="sidebarOpenMobile || !sidebarClosedDesktop">
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
            <span class="user-avatar-chip" aria-hidden="true">
              {{ getUserInitial() }}
            </span>
            <span class="fw-semibold text-dark small d-none d-md-inline">{{ currentUserName }}</span>
          </div>

          <!-- Internal Mailbox Icon with live badge -->
          <a [routerLink]="getMailRoute()" class="btn btn-sm btn-icon-mailbox position-relative" title="Internal Mailbox" aria-label="Internal Mailbox">
            <i class="bi bi-envelope fs-5"></i>
            <span *ngIf="unreadNotificationCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.65rem; padding: 0.25em 0.45em; border: 2px solid #ffffff;">
              {{ unreadNotificationCount > 9 ? '9+' : unreadNotificationCount }}
            </span>
          </a>

          <!-- Sign Out Button -->
          <button class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1.5 px-2.5 px-sm-3 py-1" (click)="showLogoutConfirm = true" title="Sign Out" aria-label="Sign Out">
            <i class="bi bi-box-arrow-right"></i>
            <span class="d-none d-sm-inline">Sign Out</span>
          </button>
        </div>
      </header>

      <!-- 2. APPLICATION BODY: SIDEBAR + MAIN CONTENT -->
      <div class="app-body">
        
        <!-- Mobile Backdrop Overlay -->
        <div class="mobile-backdrop" [class.show]="sidebarOpenMobile" (click)="sidebarOpenMobile = false" aria-hidden="true"></div>

        <!-- Persistent Sidebar (Smooth Slide-Toggle) -->
        <aside
          class="app-sidebar"
          [class.desktop-collapsed]="sidebarClosedDesktop"
          [class.mobile-open]="sidebarOpenMobile"
          [attr.aria-hidden]="sidebarClosedDesktop || !sidebarOpenMobile"
          role="navigation"
          aria-label="Main navigation">
        
        <!-- Associate Info Box in Sidebar -->
        <div class="sidebar-user-card" *ngIf="currentUserName">
          <div class="d-flex align-items-center gap-2.5">
            <div class="sidebar-user-avatar" aria-hidden="true">
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
            <a class="nav-item-link" routerLink="/coach/dashboard" routerLinkActive="active" (click)="onNavClick()" tabindex="0" role="menuitem">
              <i class="bi bi-grid-1x2-fill" aria-hidden="true"></i>
              <span>Dashboard</span>
            </a>
            <a class="nav-item-link" routerLink="/coach/upload" routerLinkActive="active" (click)="onNavClick()" tabindex="0" role="menuitem">
              <i class="bi bi-plus-circle-fill" aria-hidden="true"></i>
              <span>Add Cohort</span>
            </a>
            <a class="nav-item-link" routerLink="/coach/cohorts" routerLinkActive="active" (click)="onNavClick()" tabindex="0" role="menuitem">
              <i class="bi bi-collection-fill" aria-hidden="true"></i>
              <span>My Cohorts</span>
            </a>
            <a class="nav-item-link" routerLink="/coach/mail" routerLinkActive="active" (click)="onNavClick()" tabindex="0" role="menuitem">
              <i class="bi bi-envelope-fill" aria-hidden="true"></i>
              <span>Mailbox</span>
            </a>
          </ng-container>

          <!-- TRAINER NAV -->
          <ng-container *ngIf="currentUserRole === 'TRAINER'">
            <a class="nav-item-link" routerLink="/trainer/dashboard" routerLinkActive="active" (click)="onNavClick()" tabindex="0" role="menuitem">
              <i class="bi bi-grid-1x2-fill" aria-hidden="true"></i>
              <span>Dashboard</span>
            </a>
            <a class="nav-item-link" routerLink="/trainer/cohorts" routerLinkActive="active" (click)="onNavClick()" tabindex="0" role="menuitem">
              <i class="bi bi-calendar-check-fill" aria-hidden="true"></i>
              <span>My Cohorts</span>
            </a>
            <a class="nav-item-link" routerLink="/trainer/mail" routerLinkActive="active" (click)="onNavClick()" tabindex="0" role="menuitem">
              <i class="bi bi-envelope-fill" aria-hidden="true"></i>
              <span>Mailbox</span>
            </a>
          </ng-container>

          <!-- ADMIN NAV -->
          <ng-container *ngIf="currentUserRole === 'ADMIN'">
            <a class="nav-item-link" routerLink="/admin/dashboard" routerLinkActive="active" (click)="onNavClick()" tabindex="0" role="menuitem">
              <i class="bi bi-grid-1x2-fill" aria-hidden="true"></i>
              <span>Dashboard</span>
            </a>
            <a class="nav-item-link" routerLink="/admin/cohorts" routerLinkActive="active" (click)="onNavClick()" tabindex="0" role="menuitem">
              <i class="bi bi-diagram-3-fill" aria-hidden="true"></i>
              <span>All Cohorts</span>
            </a>
            <a class="nav-item-link" routerLink="/admin/trainers" routerLinkActive="active" (click)="onNavClick()" tabindex="0" role="menuitem">
              <i class="bi bi-people-fill" aria-hidden="true"></i>
              <span>Trainers Pool</span>
            </a>
            <a class="nav-item-link" routerLink="/admin/mail" routerLinkActive="active" (click)="onNavClick()" tabindex="0" role="menuitem">
              <i class="bi bi-envelope-fill" aria-hidden="true"></i>
              <span>Mailbox</span>
            </a>
          </ng-container>
        </nav>

        <!-- Sidebar Footer with Sign Out -->
        <div class="sidebar-bottom-action">
          <button type="button" class="nav-item-link text-danger border-0 bg-transparent w-100" (click)="showLogoutConfirm = true" tabindex="0" role="menuitem">
            <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
            <span>Sign Out</span>
          </button>
        </div>
        </aside>

        <!-- 3. MAIN INDEPENDENTLY SCROLLABLE CONTENT (Expands smoothly to 100% when sidebar is toggled) -->
        <main class="app-main-content" role="main">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Logout Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showLogoutConfirm" (click)="showLogoutConfirm = false" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title">
        <div class="modal-card modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-body p-4 text-center">
            <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger mb-3" style="width: 52px; height: 52px; font-size: 22px;" aria-hidden="true">
              <i class="bi bi-box-arrow-right"></i>
            </div>
            <h5 id="logout-modal-title" class="modal-title fw-bold text-dark mb-2">Confirm Sign Out</h5>
            <p class="text-muted small mb-4">Are you sure you want to end your current TrainMate session?</p>
            <div class="d-flex justify-content-center gap-2">
              <button type="button" class="btn btn-secondary-custom px-4" (click)="showLogoutConfirm = false">Cancel</button>
              <button type="button" class="btn btn-danger px-4" (click)="executeLogout()">Sign Out</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* Add focus styles for accessibility */
    .nav-item-link:focus,
    .action-btn:focus,
    .btn-primary-custom:focus,
    .btn-secondary-custom:focus,
    .navbar-hamburger-btn:focus {
      outline: 2px solid #0066f5;
      outline-offset: 2px;
    }
    
    .modal-overlay:focus {
      outline: none;
    }
    
    .modal-card:focus {
      outline: 2px solid #0066f5;
      outline-offset: 2px;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthPage: boolean = true;
  sidebarClosedDesktop: boolean = false;
  sidebarOpenMobile: boolean = false;
  showLogoutConfirm: boolean = false;
  currentUserRole: string = '';
  currentUserName: string = '';
  unreadNotificationCount: number = 0;
  private isMobile: boolean = false;
  private resizeSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthPage = event.urlAfterRedirects.startsWith('/login') || event.url === '/';
      this.sidebarOpenMobile = false;
      this.syncUserInfo();
      this.fetchUnreadNotifications();
    });

    this.resizeSubscription = new Subscription();
  }

  ngOnDestroy(): void {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showLogoutConfirm) {
      this.showLogoutConfirm = false;
    }
  }

  private checkScreenSize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 992;
    
    // Reset mobile sidebar state when switching to desktop
    if (wasMobile && !this.isMobile) {
      this.sidebarOpenMobile = false;
    }
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.sidebarOpenMobile = !this.sidebarOpenMobile;
    } else {
      this.sidebarClosedDesktop = !this.sidebarClosedDesktop;
    }
  }

  onNavClick(): void {
    if (this.isMobile) {
      this.sidebarOpenMobile = false;
    }
  }

  syncUserInfo(): void {
    const user = this.authService.currentUserValue;
    this.currentUserRole = user?.role || '';
    this.currentUserName = user?.name || 'Associate';
  }

  fetchUnreadNotifications(): void {
    const user = this.authService.currentUserValue;
    if (!user || !user.userId) return;
    this.notificationService.getUnreadCount(user.userId).subscribe({
      next: res => {
        if (res.success) {
          this.unreadNotificationCount = res.data;
        }
      },
      error: () => {}
    });
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
