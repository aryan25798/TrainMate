import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TrainerService } from '../../services/trainer.service';
import { AuthService } from '../../services/auth.service';
import { Cohort, TrainerDashboard } from '../../models/models';
import { CohortDetailsModalComponent } from '../../shared/cohort-details-modal.component';
import { SkeletonCardComponent } from '../../shared/skeleton/skeleton-card.component';
import { SkeletonTableComponent } from '../../shared/skeleton/skeleton-table.component';
import { ErrorCardComponent } from '../../shared/error-card.component';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';
import { getInitials } from '../../shared/utils/helpers';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-trainer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CohortDetailsModalComponent,
    SkeletonCardComponent,
    SkeletonTableComponent,
    ErrorCardComponent,
    StatusBadgePipe
  ],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Trainer Dashboard</h1>
          <p class="page-subtitle">Welcome back, {{ userName }}! Review your assigned cohorts and schedule.</p>
        </div>
      </div>

      <!-- Error State with Retry -->
      <app-error-card
        *ngIf="hasError"
        title="Unable to load trainer dashboard"
        message="A network error occurred or the cloud server is waking up. Click below to retry."
        [isRetrying]="isLoading"
        (retry)="loadData()">
      </app-error-card>

      <!-- Stat Cards -->
      <div class="stats-grid mb-4" *ngIf="!hasError">
        <ng-container *ngIf="isLoading">
          <app-skeleton-card></app-skeleton-card>
          <app-skeleton-card></app-skeleton-card>
          <app-skeleton-card></app-skeleton-card>
        </ng-container>

        <ng-container *ngIf="!isLoading">
          <div class="stat-card">
            <div>
              <div class="stat-title">Active Cohorts</div>
              <div class="stat-value text-primary">{{ dashboard?.active || 0 }}</div>
            </div>
            <div class="stat-icon blue">
              <i class="bi bi-play-circle-fill"></i>
            </div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-title">Completed Cohorts</div>
              <div class="stat-value text-success">{{ dashboard?.completed || 0 }}</div>
            </div>
            <div class="stat-icon green">
              <i class="bi bi-check2-all"></i>
            </div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-title">Mails & Alerts</div>
              <div class="stat-value text-primary">{{ dashboard?.unread || 0 }}</div>
            </div>
            <div class="stat-icon blue">
              <i class="bi bi-envelope-fill"></i>
            </div>
          </div>
        </ng-container>
      </div>

      <!-- Assigned Cohorts Table (FRD Section 46) -->
      <div class="content-card" *ngIf="!hasError">
        <div class="content-card-header">
          <h3 class="content-card-title">My Assigned Cohorts</h3>
          <a routerLink="/trainer/cohorts" class="btn btn-sm btn-outline-secondary">View All</a>
        </div>

        <app-skeleton-table *ngIf="isLoading" [rows]="4" [columns]="8"></app-skeleton-table>

        <div class="table-responsive" *ngIf="!isLoading">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th class="text-nowrap">Cohort Code</th>
                <th>Required Skill</th>
                <th class="text-nowrap">Coach</th>
                <th class="text-nowrap">Trainees</th>
                <th class="text-nowrap">Duration</th>
                <th>Location</th>
                <th class="text-nowrap">Status</th>
                <th class="text-end text-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of cohorts">
                <td class="fw-bold text-dark text-nowrap" data-label="Cohort Code">{{ c.cohortCode }}</td>
                <td data-label="Required Skill"><span class="badge-tag">{{ c.requiredSkill }}</span></td>
                <td class="text-nowrap" data-label="Coach">{{ c.coachName || 'N/A' }}</td>
                <td class="text-nowrap" data-label="Trainees">{{ c.numberOfTrainees }}</td>
                <td class="text-nowrap" data-label="Duration">
                  <div class="fw-medium small text-dark">{{ c.startDate }}</div>
                  <small class="text-muted">{{ c.endDate }}</small>
                </td>
                <td class="text-nowrap" data-label="Location">{{ c.location }}</td>
                <td class="text-nowrap" data-label="Status">
                  <span class="badge-status" [ngClass]="c.status | statusBadge">{{ c.status }}</span>
                </td>
                <td class="text-end text-nowrap action-cell" data-label="Actions">
                  <div class="action-btn-group">
                    <button class="action-btn btn-view" title="View Cohort Details" (click)="selectedCohort = c" aria-label="View cohort details">
                      <i class="bi bi-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="cohorts.length === 0">
                <td colspan="8" class="text-center py-5">
                  <div class="d-flex flex-column align-items-center justify-content-center">
                    <i class="bi bi-calendar-check text-muted opacity-50 mb-2" style="font-size: 2.25rem;"></i>
                    <h6 class="text-dark fw-bold mb-1">No cohorts assigned yet</h6>
                    <p class="text-muted small mb-0">You will receive an automated notification when a cohort is allocated to you.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Cohort Details Modal -->
    <app-cohort-details-modal
      *ngIf="selectedCohort"
      [cohort]="selectedCohort"
      (close)="selectedCohort = null">
    </app-cohort-details-modal>
  `
})
export class TrainerDashboardComponent implements OnInit {
  dashboard: TrainerDashboard | null = null;
  cohorts: Cohort[] = [];
  selectedCohort: Cohort | null = null;
  userName: string = 'Trainer';
  isLoading: boolean = true;
  hasError: boolean = false;

  constructor(
    private trainerService: TrainerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.userName = user?.name || 'Trainer';
    this.loadData();
  }

  loadData(): void {
    const user = this.authService.currentUserValue;
    const trainerId = user?.trainerId;

    if (!trainerId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      dashboard: this.trainerService.getDashboard(trainerId),
      cohorts: this.trainerService.getCohorts(trainerId)
    }).subscribe({
      next: ({ dashboard, cohorts }) => {
        if (dashboard.success) {
          this.dashboard = dashboard.data;
        }
        if (cohorts.success) {
          this.cohorts = cohorts.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load trainer dashboard:', err);
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }

  protected readonly getInitials = getInitials;
}
