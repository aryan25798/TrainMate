import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoachService } from '../../services/coach.service';
import { AuthService } from '../../services/auth.service';
import { CoachDashboard, Cohort } from '../../models/models';
import { CohortDetailsModalComponent } from '../../shared/cohort-details-modal.component';
import { CreateCohortModalComponent } from '../../shared/create-cohort-modal.component';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';
import { getInitials } from '../../shared/utils/helpers';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CohortDetailsModalComponent, CreateCohortModalComponent, StatusBadgePipe],
  template: `
    <div>
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Coach Dashboard</h1>
          <p class="page-subtitle">Welcome back, {{ userName }}! Track your cohorts and allocations.</p>
        </div>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-primary-custom" (click)="showCreateModal = true">
            <i class="bi bi-plus-circle-fill"></i>
            Create Cohort
          </button>
          <a routerLink="/coach/upload" class="btn btn-secondary-custom">
            <i class="bi bi-cloud-arrow-up-fill text-primary"></i>
            Upload / Batch
          </a>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div>
            <div class="stat-title">Total Cohorts</div>
            <div class="stat-value" *ngIf="!isLoading">{{ dashboard?.totalCohorts || 0 }}</div>
            <div *ngIf="isLoading" class="skeleton-line" style="width:50px;height:32px;border-radius:6px;"></div>
          </div>
          <div class="stat-icon blue">
            <i class="bi bi-collection-fill"></i>
          </div>
        </div>

        <div class="stat-card">
          <div>
            <div class="stat-title">Assigned Cohorts</div>
            <div class="stat-value text-success" *ngIf="!isLoading">{{ dashboard?.assigned || 0 }}</div>
            <div *ngIf="isLoading" class="skeleton-line" style="width:50px;height:32px;border-radius:6px;"></div>
          </div>
          <div class="stat-icon green">
            <i class="bi bi-check-circle-fill"></i>
          </div>
        </div>

        <div class="stat-card">
          <div>
            <div class="stat-title">Unassigned Cohorts</div>
            <div class="stat-value text-danger" *ngIf="!isLoading">{{ dashboard?.unassigned || 0 }}</div>
            <div *ngIf="isLoading" class="skeleton-line" style="width:50px;height:32px;border-radius:6px;"></div>
          </div>
          <div class="stat-icon red">
            <i class="bi bi-exclamation-octagon-fill"></i>
          </div>
        </div>

        <div class="stat-card">
          <div>
            <div class="stat-title">Allocation Rate</div>
            <div class="stat-value text-primary" *ngIf="!isLoading">{{ allocationRate }}%</div>
            <div *ngIf="isLoading" class="skeleton-line" style="width:60px;height:32px;border-radius:6px;"></div>
          </div>
          <div class="stat-icon purple">
            <i class="bi bi-bullseye"></i>
          </div>
        </div>
      </div>

      <!-- Recent Cohorts Table (FRD Section 41) -->
      <div class="content-card">
        <div class="content-card-header">
          <h3 class="content-card-title">Recent Cohorts</h3>
          <a routerLink="/coach/cohorts" class="btn btn-sm btn-outline-secondary">View All</a>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th class="text-nowrap">Cohort Code</th>
                <th>Required Skill</th>
                <th>Trainer</th>
                <th class="text-nowrap">Duration</th>
                <th class="text-nowrap">Status</th>
                <th class="text-end text-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of recentCohorts">
                <td class="fw-bold text-dark text-nowrap" data-label="Cohort Code">{{ c.cohortCode }}</td>
                <td data-label="Required Skill"><span class="badge-tag">{{ c.requiredSkill }}</span></td>
                <td class="text-nowrap" data-label="Trainer">
                  <div *ngIf="c.assignedTrainerName" class="d-flex align-items-center gap-2">
                    <span class="trainer-avatar">{{ getInitials(c.assignedTrainerName) }}</span>
                    <span class="fw-semibold text-dark" style="font-size: 0.885rem;">{{ c.assignedTrainerName }}</span>
                  </div>
                  <span *ngIf="!c.assignedTrainerName" class="badge-status badge-unassigned">Unassigned</span>
                </td>
                <td class="text-nowrap" data-label="Duration">
                  <div class="fw-medium small text-dark">{{ c.startDate }}</div>
                  <small class="text-muted">{{ c.endDate }}</small>
                </td>
                <td class="text-nowrap" data-label="Status">
                  <span class="badge-status" [ngClass]="c.status | statusBadge">{{ c.status }}</span>
                </td>
                <td class="text-end text-nowrap action-cell" data-label="Actions">
                  <div class="action-btn-group">
                    <button class="action-btn btn-view" title="View Cohort Details" (click)="selectedCohort = c" aria-label="View cohort details">
                      <i class="bi bi-eye" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="recentCohorts.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">
                  No cohorts found. Create or upload your first cohort using the buttons above.
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

    <!-- Create Cohort Modal -->
    <app-create-cohort-modal
      *ngIf="showCreateModal"
      (close)="showCreateModal = false"
      (cohortCreated)="onCohortCreated($event)">
    </app-create-cohort-modal>
  `,
  styles: [`
    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .skeleton-line {
      background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
      background-size: 800px 100%;
      animation: shimmer 1.4s infinite linear;
      display: inline-block;
    }
  `]
})
export class CoachDashboardComponent implements OnInit {
  dashboard: CoachDashboard | null = null;
  recentCohorts: Cohort[] = [];
  selectedCohort: Cohort | null = null;
  showCreateModal: boolean = false;
  userName: string = 'Coach';
  isLoading: boolean = true;

  constructor(
    private coachService: CoachService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.userName = user?.name || 'Coach';
    this.loadData();
  }

  get allocationRate(): number {
    if (!this.dashboard || !this.dashboard.totalCohorts) return 0;
    return Math.round((this.dashboard.assigned / this.dashboard.totalCohorts) * 100);
  }

  loadData(): void {
    const user = this.authService.currentUserValue;
    const coachId = user?.coachId ?? user?.userId;
    if (!coachId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.coachService.getDashboard(coachId).subscribe({
      next: res => {
        if (res.success) {
          this.dashboard = res.data;
        }
        this.isLoading = false;
      },
      error: err => {
        console.error('Failed to load coach dashboard:', err);
        this.isLoading = false;
      }
    });

    this.coachService.getCohorts(coachId).subscribe({
      next: res => {
        if (res.success) {
          this.recentCohorts = res.data.slice(0, 5);
        }
      },
      error: err => console.error('Failed to load coach cohorts:', err)
    });
  }

  onCohortCreated(created: Cohort): void {
    this.loadData();
    this.selectedCohort = created; // automatically open details modal to show allocation result!
  }

  protected readonly getInitials = getInitials;
}
