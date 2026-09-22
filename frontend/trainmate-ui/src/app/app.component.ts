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
    <div *ngIf="isAuthPage">
      <router-outlet></router-outlet>
    </div>

    <!-- If logged in on dashboard/app pages, show corporate dashboard layout with responsive sidebar -->
    <div *ngIf="!isAuthPage" class="d-flex flex-column min-vh-100">
      
      <!-- Mobile Top Navigation Bar -->
      <div class="mobile-topbar">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-light border-0 px-1 py-0" (click)="sidebarOpen = !sidebarOpen">
            <i class="bi bi-list fs-3"></i>
          </button>
          <div class="fw-bold fs-6 d-flex align-items-center gap-2 text-white">
            <i class="bi bi-mortarboard-fill text-info"></i>
            <span>TRAINMATE</span>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-primary-subtle text-primary">{{ currentUserRole }}</span>
          <button class="btn btn-sm btn-outline-light border-0 px-1" (click)="onLogout()" title="Sign Out">
            <i class="bi bi-box-arrow-right fs-5"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Backdrop Overlay -->
      <div class="mobile-backdrop" [class.show]="sidebarOpen" (click)="sidebarOpen = false"></div>

      <div class="app-container">
        <app-sidebar [isOpen]="sidebarOpen" (linkClicked)="sidebarOpen = false"></app-sidebar>
        
        <div class="d-flex flex-column flex-grow-1 overflow-hidden">
          
          <!-- Desktop Corporate Header Bar -->
          <header class="top-header-bar">
            <div class="d-flex align-items-center gap-2">
              <span class="fw-bold text-dark fs-6">Cognizant Academy</span>
              <span class="text-muted small">&bull;</span>
              <span class="text-secondary small fw-medium">Global Cohort & Trainer Resource Operations</span>
            </div>

            <div class="d-flex align-items-center gap-3">
              <!-- Role Badge -->
              <span class="badge px-2.5 py-1.5 fw-semibold" [ngClass]="getRoleBadgeClass()">
                {{ currentUserRole }}
              </span>

              <!-- User Profile Chip -->
              <div class="d-flex align-items-center gap-2 px-2.5 py-1 bg-light rounded-pill border">
                <span class="trainer-avatar" style="width: 26px; height: 26px; font-size: 11px;">
                  {{ getUserInitial() }}
                </span>
                <span class="fw-semibold text-dark small">{{ currentUserName }}</span>
              </div>

              <!-- Quick Mailbox Icon -->
              <a [routerLink]="getMailRoute()" class="btn btn-sm btn-outline-secondary border-0 px-2 text-secondary" title="Internal Mailbox">
                <i class="bi bi-envelope fs-5"></i>
              </a>

              <!-- Sign Out Button -->
              <button class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1.5 px-3 py-1" (click)="onLogout()" title="Sign Out">
                <i class="bi bi-box-arrow-right"></i>
                <span>Sign Out</span>
              </button>
            </div>
          </header>

          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </div>
  `
})
export class AppComponent {
  isAuthPage: boolean = true;
  sidebarOpen: boolean = false;
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
