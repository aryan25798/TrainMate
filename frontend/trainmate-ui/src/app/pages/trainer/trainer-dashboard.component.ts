import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TrainerService } from '../../services/trainer.service';
import { AuthService } from '../../services/auth.service';
import { Cohort, TrainerDashboard } from '../../models/models';
import { CohortDetailsModalComponent } from '../../shared/cohort-details-modal.component';

@Component({
  selector: 'app-trainer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CohortDetailsModalComponent],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Trainer Dashboard</h1>
          <p class="page-subtitle">Welcome back, {{ userName }}! Review your assigned cohorts and schedule.</p>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid">
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
      </div>

      <!-- Assigned Cohorts Table (FRD Section 46) -->
      <div class="content-card">
        <div class="content-card-header">
          <h3 class="content-card-title">My Assigned Cohorts</h3>
          <a routerLink="/trainer/cohorts" class="btn btn-sm btn-outline-secondary">View All</a>
        </div>

        <div class="table-responsive">
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
                <td class="fw-bold text-dark text-nowrap">{{ c.cohortCode }}</td>
                <td><span class="badge-tag">{{ c.requiredSkill }}</span></td>
                <td class="text-nowrap">{{ c.coachName || 'N/A' }}</td>
                <td class="text-nowrap">{{ c.numberOfTrainees }}</td>
                <td class="text-nowrap">
                  <div class="fw-medium small text-dark">{{ c.startDate }}</div>
                  <small class="text-muted">{{ c.endDate }}</small>
                </td>
                <td class="text-nowrap">{{ c.location }}</td>
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
              <tr *ngIf="cohorts.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  No cohorts have been assigned to you yet.
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

  constructor(
    private trainerService: TrainerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.userName = user?.name || 'Trainer';
    const trainerId = user?.trainerId || 1;

    this.trainerService.getDashboard(trainerId).subscribe({
      next: res => {
        if (res.success) {
          this.dashboard = res.data;
        }
      }
    });

    this.trainerService.getCohorts(trainerId).subscribe({
      next: res => {
        if (res.success) {
          this.cohorts = res.data;
        }
      }
    });
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
