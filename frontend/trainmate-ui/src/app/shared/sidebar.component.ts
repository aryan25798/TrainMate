import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User, UserRole } from '../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.show]="isOpen" [class.collapsed]="isCollapsed">
      <div class="sidebar-brand d-flex justify-content-between align-items-center">
        <div class="d-flex flex-column">
          <div class="sidebar-brand-title">
            <i class="bi bi-mortarboard-fill"></i>
            <span class="sidebar-text">TRAINMATE</span>
          </div>
          <span class="cognizant-badge">Cognizant Academy</span>
        </div>
        <button class="btn btn-sm btn-outline-light border-0 d-lg-none" (click)="linkClicked.emit()" title="Close menu">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- User Profile Badge -->
      <div class="px-3 pt-3">
        <div class="user-profile-badge" *ngIf="user" [title]="user.name + ' (' + user.role + ')'">
          <div class="user-avatar">
            {{ user.name.charAt(0) }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-role-badge">{{ user.role }}</div>
          </div>
        </div>
      </div>

      <!-- Navigation Links according to Role -->
      <ul class="sidebar-nav">
        <!-- COACH NAV -->
        <ng-container *ngIf="role === 'COACH'">
          <li class="nav-item">
            <a class="nav-link" routerLink="/coach/dashboard" routerLinkActive="active" (click)="linkClicked.emit()" title="Dashboard">
              <i class="bi bi-grid-1x2-fill"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/coach/upload" routerLinkActive="active" (click)="linkClicked.emit()" title="Add Cohort">
              <i class="bi bi-plus-circle-fill"></i>
              <span>Add Cohort</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/coach/cohorts" routerLinkActive="active" (click)="linkClicked.emit()" title="My Cohorts">
              <i class="bi bi-collection-fill"></i>
              <span>My Cohorts</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/coach/mail" routerLinkActive="active" (click)="linkClicked.emit()" title="Internal Mailbox">
              <i class="bi bi-envelope-fill"></i>
              <span>Mail</span>
            </a>
          </li>
        </ng-container>

        <!-- TRAINER NAV -->
        <ng-container *ngIf="role === 'TRAINER'">
          <li class="nav-item">
            <a class="nav-link" routerLink="/trainer/dashboard" routerLinkActive="active" (click)="linkClicked.emit()" title="Dashboard">
              <i class="bi bi-grid-1x2-fill"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/trainer/cohorts" routerLinkActive="active" (click)="linkClicked.emit()" title="My Cohorts">
              <i class="bi bi-calendar-check-fill"></i>
              <span>My Cohorts</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/trainer/mail" routerLinkActive="active" (click)="linkClicked.emit()" title="Internal Mailbox">
              <i class="bi bi-envelope-fill"></i>
              <span>Mail</span>
            </a>
          </li>
        </ng-container>

        <!-- ADMIN NAV -->
        <ng-container *ngIf="role === 'ADMIN'">
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/dashboard" routerLinkActive="active" (click)="linkClicked.emit()" title="Dashboard">
              <i class="bi bi-grid-1x2-fill"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/cohorts" routerLinkActive="active" (click)="linkClicked.emit()" title="All Cohorts">
              <i class="bi bi-diagram-3-fill"></i>
              <span>All Cohorts</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/trainers" routerLinkActive="active" (click)="linkClicked.emit()" title="Trainers Directory">
              <i class="bi bi-people-fill"></i>
              <span>Trainers</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/mail" routerLinkActive="active" (click)="linkClicked.emit()" title="Internal Mailbox">
              <i class="bi bi-envelope-fill"></i>
              <span>Mail</span>
            </a>
          </li>
        </ng-container>
      </ul>

      <!-- Logout button with Confirmation -->
      <div class="sidebar-footer">
        <button class="nav-link w-100 border-0 bg-transparent text-start text-danger" (click)="confirmLogout()" title="Logout">
          <i class="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Logout Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showLogoutModal" (click)="showLogoutModal = false">
      <div class="modal-card modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-body p-4 text-center">
          <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger mb-3" style="width: 52px; height: 52px; font-size: 22px;">
            <i class="bi bi-box-arrow-right"></i>
          </div>
          <h5 class="modal-title fw-bold text-dark mb-2">Confirm Sign Out</h5>
          <p class="text-muted small mb-4">Are you sure you want to end your current session?</p>
          <div class="d-flex justify-content-center gap-2">
            <button type="button" class="btn btn-secondary-custom px-4" (click)="showLogoutModal = false">Cancel</button>
            <button type="button" class="btn btn-danger px-4" (click)="executeLogout()">Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() isCollapsed: boolean = false;
  @Output() linkClicked = new EventEmitter<void>();

  user: User | null = null;
  role: string = '';
  showLogoutModal: boolean = false;
  private authSub: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe((user: User | null) => {
      this.user = user;
      this.role = user ? user.role : '';
    });
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  confirmLogout(): void {
    this.showLogoutModal = true;
  }

  executeLogout(): void {
    this.showLogoutModal = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
