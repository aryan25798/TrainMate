import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './shared/sidebar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
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
          <div class="fw-bold fs-6 d-flex align-items-center gap-2">
            <i class="bi bi-mortarboard-fill text-info"></i>
            <span>TRAINMATE</span>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-primary-subtle text-primary">{{ currentUserRole }}</span>
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
              <span class="fw-bold text-dark fs-6">Cognizant Academy Portal</span>
              <span class="text-muted small">&bull;</span>
              <span class="text-secondary small fw-medium">Automatic Trainer Allocation</span>
            </div>

            <div class="d-flex align-items-center gap-3">
              <div class="system-status-chip">
                <span class="status-dot-pulse"></span>
                <span>MySQL Connected</span>
              </div>
              <span class="badge bg-light text-dark border px-2.5 py-1.5 fw-semibold">
                {{ currentUserRole }}
              </span>
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

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthPage = event.urlAfterRedirects.startsWith('/login') || event.url === '/';
      this.sidebarOpen = false;
      this.currentUserRole = this.authService.getRole() || '';
    });
  }
}
