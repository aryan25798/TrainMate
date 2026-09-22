import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './shared/sidebar.component';
import { ToastContainerComponent } from './shared/toast-container.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, ToastContainerComponent],
  template: `
    <!-- Global Toast Notifications -->
    <app-toast-container></app-toast-container>

    <!-- If on Login page, show full-screen view -->
    <div *ngIf="isAuthPage" class="login-container">
      <router-outlet></router-outlet>
    </div>

    <!-- If logged in on dashboard/app pages, show enterprise viewport-locked shell -->
    <div *ngIf="!isAuthPage" class="app-shell">
      
      <!-- Mobile Backdrop Overlay -->
      <div class="mobile-backdrop" [class.show]="sidebarOpen" (click)="sidebarOpen = false"></div>

      <!-- Persistent Full-Height Sidebar (Locked to Screen, never scrolls out of view) -->
      <app-sidebar
        [isOpen]="sidebarOpen"
        [isCollapsed]="sidebarCollapsed"
        (linkClicked)="sidebarOpen = false">
      </app-sidebar>

      <!-- Main Viewport Column (Fixed Header + Independently Scrollable Main Content) -->
      <div class="main-wrapper">
        
        <!-- Corporate Top Header Bar with Universal Hamburger Menu -->
        <header class="top-header-bar">
          <div class="d-flex align-items-center">
            <!-- Universal Responsive Hamburger Toggle Button -->
            <button
              type="button"
              class="hamburger-btn"
              (click)="toggleSidebar()"
              [title]="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
              <i class="bi bi-list"></i>
            </button>

            <!-- Brand Info -->
            <div class="d-flex align-items-center gap-2">
              <span class="fw-bold text-dark fs-6 text-nowrap">Cognizant Academy</span>
              <span class="text-muted small d-none d-md-inline">&bull;</span>
              <span class="text-secondary small fw-medium d-none d-md-inline text-truncate">Global Cohort & Trainer Resource Operations</span>
            </div>
          </div>

          <!-- Header Right Profile Controls -->
          <div class="d-flex align-items-center gap-2 gap-sm-3">
            <!-- Role Badge -->
            <span class="badge px-2.5 py-1.5 fw-semibold d-none d-sm-inline-block" [ngClass]="getRoleBadgeClass()">
              {{ currentUserRole }}
            </span>

            <!-- User Profile Chip -->
            <div class="user-header-chip">
              <span class="trainer-avatar" style="width: 26px; height: 26px; font-size: 11px;">
                {{ getUserInitial() }}
              </span>
              <span class="fw-semibold text-dark small d-none d-sm-inline">{{ currentUserName }}</span>
            </div>

            <!-- Mailbox Icon -->
            <a [routerLink]="getMailRoute()" class="btn btn-sm btn-outline-secondary border-0 px-2 text-secondary" title="Internal Mailbox">
              <i class="bi bi-envelope fs-5"></i>
            </a>

            <!-- Sign Out Button -->
            <button class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1.5 px-2.5 px-sm-3 py-1" (click)="onLogout()" title="Sign Out">
              <i class="bi bi-box-arrow-right"></i>
              <span class="d-none d-sm-inline">Sign Out</span>
            </button>
          </div>
        </header>

        <!-- Only Main Content Scrolls (Sidebar & Header remain anchored permanently) -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AppComponent {
  isAuthPage: boolean = true;
  sidebarOpen: boolean = false;
  sidebarCollapsed: boolean = false;
  currentUserRole: string = '';
  currentUserName: string = '';

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthPage = event.urlAfterRedirects.startsWith('/login') || event.url === '/';
      this.sidebarOpen = false;
      this.syncUserInfo();
    });
  }

  toggleSidebar(): void {
    if (window.innerWidth < 992) {
      this.sidebarOpen = !this.sidebarOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
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

  onLogout(): void {
    this.authService.logout();
  }
}
