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
    <aside class="sidebar" [class.show]="isOpen">
      <div class="sidebar-brand d-flex justify-content-between align-items-center">
        <div>
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-mortarboard-fill"></i>
            <span>TRAINMATE</span>
          </div>
          <span class="cognizant-badge mt-1 d-inline-block">Cognizant Academy</span>
        </div>
        <button class="btn btn-sm btn-outline-light border-0 d-lg-none" (click)="linkClicked.emit()">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- User Profile Badge -->
      <div class="px-3 pt-3">
        <div class="user-profile-badge" *ngIf="user">
          <div class="user-avatar">
            {{ user.name.charAt(0) }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-role">{{ user.role }}</div>
          </div>
        </div>
      </div>

      <!-- Navigation Links according to Role -->
      <ul class="sidebar-nav">
        <!-- COACH NAV -->
        <ng-container *ngIf="role === 'COACH'">
          <li class="nav-item">
            <a class="nav-link" routerLink="/coach/dashboard" routerLinkActive="active" (click)="linkClicked.emit()">
              <i class="bi bi-grid-1x2-fill"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/coach/upload" routerLinkActive="active" (click)="linkClicked.emit()">
              <i class="bi bi-plus-circle-fill"></i>
              <span>Add Cohort</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/coach/cohorts" routerLinkActive="active" (click)="linkClicked.emit()">
              <i class="bi bi-collection-fill"></i>
              <span>My Cohorts</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/coach/mail" routerLinkActive="active" (click)="linkClicked.emit()">
              <i class="bi bi-envelope-fill"></i>
              <span>Mail</span>
            </a>
          </li>
        </ng-container>

        <!-- TRAINER NAV -->
        <ng-container *ngIf="role === 'TRAINER'">
          <li class="nav-item">
            <a class="nav-link" routerLink="/trainer/dashboard" routerLinkActive="active" (click)="linkClicked.emit()">
              <i class="bi bi-grid-1x2-fill"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/trainer/cohorts" routerLinkActive="active" (click)="linkClicked.emit()">
              <i class="bi bi-calendar-check-fill"></i>
              <span>My Cohorts</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/trainer/mail" routerLinkActive="active" (click)="linkClicked.emit()">
              <i class="bi bi-envelope-fill"></i>
              <span>Mail</span>
            </a>
          </li>
        </ng-container>

        <!-- ADMIN NAV -->
        <ng-container *ngIf="role === 'ADMIN'">
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/dashboard" routerLinkActive="active" (click)="linkClicked.emit()">
              <i class="bi bi-grid-1x2-fill"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/cohorts" routerLinkActive="active" (click)="linkClicked.emit()">
              <i class="bi bi-diagram-3-fill"></i>
              <span>All Cohorts</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/trainers" routerLinkActive="active" (click)="linkClicked.emit()">
              <i class="bi bi-people-fill"></i>
              <span>Trainers</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/mail" routerLinkActive="active" (click)="linkClicked.emit()">
              <i class="bi bi-envelope-fill"></i>
              <span>Mail</span>
            </a>
          </li>
        </ng-container>
      </ul>

      <!-- Logout button with Confirmation -->
      <div class="sidebar-footer">
        <button class="nav-link w-100 border-0 bg-transparent text-start text-danger" (click)="confirmLogout()">
          <i class="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Logout Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showLogoutModal">
      <div class="modal-card" style="max-width: 400px;">
        <div class="modal-header">
          <h5 class="modal-title fs-5 fw-bold mb-0">Confirm Logout</h5>
          <button type="button" class="btn-close" (click)="showLogoutModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="text-secondary mb-0">Are you sure you want to log out of TrainMate?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-sm btn-secondary-custom" (click)="showLogoutModal = false">Cancel</button>
          <button class="btn btn-sm btn-danger" (click)="executeLogout()">Logout</button>
        </div>
      </div>
    </div>
  `
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Output() linkClicked = new EventEmitter<void>();

  user: User | null = null;
  role: UserRole | null = null;
  showLogoutModal: boolean = false;
  private sub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.authService.currentUser$.subscribe((u: User | null) => {
      this.user = u;
      this.role = u?.role || null;
    });
  }

  confirmLogout(): void {
    this.showLogoutModal = true;
  }

  executeLogout(): void {
    this.showLogoutModal = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
