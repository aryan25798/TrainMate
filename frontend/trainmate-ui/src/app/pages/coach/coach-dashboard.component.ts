import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoachService } from '../../services/coach.service';
import { AuthService } from '../../services/auth.service';
import { CoachDashboard, Cohort } from '../../models/models';
import { CohortDetailsModalComponent } from '../../shared/cohort-details-modal.component';
import { CreateCohortModalComponent } from '../../shared/create-cohort-modal.component';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CohortDetailsModalComponent, CreateCohortModalComponent],
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
            <div class="stat-value">{{ dashboard?.totalCohorts || 0 }}</div>
          </div>
          <div class="stat-icon blue">
            <i class="bi bi-collection-fill"></i>
          </div>
        </div>

        <div class="stat-card">
          <div>
            <div class="stat-title">Assigned Cohorts</div>
            <div class="stat-value text-success">{{ dashboard?.assigned || 0 }}</div>
          </div>
          <div class="stat-icon green">
            <i class="bi bi-check-circle-fill"></i>
          </div>
        </div>

        <div class="stat-card">
          <div>
            <div class="stat-title">Unassigned Cohorts</div>
            <div class="stat-value text-danger">{{ dashboard?.unassigned || 0 }}</div>
          </div>
          <div class="stat-icon red">
            <i class="bi bi-exclamation-octagon-fill"></i>
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
                <td class="fw-bold text-dark text-nowrap">{{ c.cohortCode }}</td>
                <td><span class="badge-tag">{{ c.requiredSkill }}</span></td>
                <td class="text-nowrap">
                  <div *ngIf="c.assignedTrainerName" class="d-flex align-items-center gap-2">
                    <span class="trainer-avatar">{{ c.assignedTrainerName.charAt(0) }}</span>
                    <span class="fw-semibold text-dark" style="font-size: 0.885rem;">{{ c.assignedTrainerName }}</span>
                  </div>
                  <span *ngIf="!c.assignedTrainerName" class="badge-status badge-unassigned">Unassigned</span>
                </td>
                <td class="text-nowrap">
                  <div class="fw-medium small text-dark">{{ c.startDate }}</div>
                  <small class="text-muted">{{ c.endDate }}</small>
                </td>
                <td class="text-nowrap">
                  <span class="badge-status" [ngClass]="getStatusBadgeClass(c.status)">{{ c.status }}</span>
                </td>
                <td class="text-end text-nowrap">
                  <div class="action-btn-group">
                    <button class="action-btn btn-view" title="View Cohort Details" (click)="selectedCohort = c">
                      <i class="bi bi-eye"></i>
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
  `
})
export class CoachDashboardComponent implements OnInit {
  dashboard: CoachDashboard | null = null;
  recentCohorts: Cohort[] = [];
  selectedCohort: Cohort | null = null;
  showCreateModal: boolean = false;
  userName: string = 'Coach';

  constructor(
    private coachService: CoachService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.userName = user?.name || 'Coach';
    this.loadData();
  }

  loadData(): void {
    const user = this.authService.currentUserValue;
    const coachId = user?.coachId ?? user?.userId;
    if (!coachId) return;

    this.coachService.getDashboard(coachId).subscribe({
      next: res => {
        if (res.success) {
          this.dashboard = res.data;
        }
      },
      error: err => console.error('Failed to load coach dashboard:', err)
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

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ASSIGNED': return 'badge-assigned';
      case 'UNASSIGNED': return 'badge-unassigned';
      case 'PENDING': return 'badge-pending';
      case 'ACTIVE': return 'badge-active';
      case 'COMPLETED': return 'badge-completed';
      case 'PROCESSING': return 'badge-processing';
      default: return 'badge-secondary';
    }
  }
}
