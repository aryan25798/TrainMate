import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminDashboard } from '../../models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Admin Dashboard</h1>
          <p class="page-subtitle">Complete system oversight, trainer workloads, and allocation analytics.</p>
        </div>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-secondary-custom" (click)="exportReport()">
            <i class="bi bi-file-earmark-excel-fill text-success"></i>
            Export Report
          </button>
          <a routerLink="/admin/cohorts" class="btn btn-primary-custom">
            <i class="bi bi-diagram-3-fill"></i>
            Manage Cohorts
          </a>
        </div>
      </div>

      <!-- Primary Stat Cards (FRD Section 47) -->
      <div class="stats-grid">
        <div class="stat-card">
          <div>
            <div class="stat-title">Total Cohorts</div>
            <div class="stat-value" *ngIf="!isLoading">{{ dashboard?.totalCohorts || 0 }}</div>
            <div *ngIf="isLoading" class="skeleton-line" style="width:60px;height:32px;border-radius:6px;"></div>
          </div>
          <div class="stat-icon blue"><i class="bi bi-folder-fill"></i></div>
        </div>

        <div class="stat-card">
          <div>
            <div class="stat-title">Assigned Cohorts</div>
            <div class="stat-value text-success" *ngIf="!isLoading">{{ dashboard?.assignedCohorts || 0 }}</div>
            <div *ngIf="isLoading" class="skeleton-line" style="width:60px;height:32px;border-radius:6px;"></div>
          </div>
          <div class="stat-icon green"><i class="bi bi-check2-circle"></i></div>
        </div>

        <div class="stat-card">
          <div>
            <div class="stat-title">Unassigned Cohorts</div>
            <div class="stat-value text-danger" *ngIf="!isLoading">{{ dashboard?.unassignedCohorts || 0 }}</div>
            <div *ngIf="isLoading" class="skeleton-line" style="width:60px;height:32px;border-radius:6px;"></div>
          </div>
          <div class="stat-icon red"><i class="bi bi-exclamation-octagon-fill"></i></div>
        </div>

        <div class="stat-card">
          <div>
            <div class="stat-title">Available Trainers</div>
            <div class="stat-value text-primary" *ngIf="!isLoading">{{ dashboard?.availableTrainers || 0 }} / {{ dashboard?.totalTrainers || 0 }}</div>
            <div *ngIf="isLoading" class="skeleton-line" style="width:80px;height:32px;border-radius:6px;"></div>
          </div>
          <div class="stat-icon purple"><i class="bi bi-person-badge-fill"></i></div>
        </div>
      </div>

      <!-- Detailed Statistics (FRD Section 48) -->
      <!-- Detailed Statistics (FRD Section 48) -->
      <div class="row g-4 mb-4">
        <!-- Cohort Lifecycle Stats with SVG Donut -->
        <div class="col-lg-6">
          <div class="content-card mb-0 h-100">
            <div class="content-card-header">
              <h3 class="content-card-title"><i class="bi bi-pie-chart-fill text-primary me-2"></i>Cohort Allocation Health</h3>
            </div>
            <div class="p-4">
              <div class="row align-items-center">
                <div class="col-sm-5 text-center mb-3 mb-sm-0">
                  <div class="allocation-donut-wrap">
                    <svg viewBox="0 0 36 36" class="circular-chart">
                      <path class="circle-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path class="circle"
                        [attr.stroke-dasharray]="assignedPercent + ', 100'"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="19" class="donut-percent">{{ assignedPercent }}%</text>
                      <text x="18" y="24" class="donut-sublabel">ASSIGNED</text>
                    </svg>
                  </div>
                </div>
                <div class="col-sm-7">
                  <div class="d-flex justify-content-between align-items-center py-1.5 border-bottom">
                    <span class="text-muted small"><i class="bi bi-dot text-primary fs-5"></i>Active Cohorts</span>
                    <span class="fw-bold small" *ngIf="!isLoading">{{ dashboard?.activeCohorts || 0 }}</span>
                    <div *ngIf="isLoading" class="skeleton-line" style="width:30px;height:16px;border-radius:4px;"></div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center py-1.5 border-bottom">
                    <span class="text-muted small"><i class="bi bi-dot text-warning fs-5"></i>Pending Allocation</span>
                    <span class="fw-bold small" *ngIf="!isLoading">{{ dashboard?.pendingCohorts || 0 }}</span>
                    <div *ngIf="isLoading" class="skeleton-line" style="width:30px;height:16px;border-radius:4px;"></div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center py-1.5 border-bottom">
                    <span class="text-muted small"><i class="bi bi-dot text-success fs-5"></i>Assigned</span>
                    <span class="fw-bold small text-success" *ngIf="!isLoading">{{ dashboard?.assignedCohorts || 0 }}</span>
                    <div *ngIf="isLoading" class="skeleton-line" style="width:30px;height:16px;border-radius:4px;"></div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center py-1.5 border-bottom">
                    <span class="text-muted small"><i class="bi bi-dot text-danger fs-5"></i>Unassigned</span>
                    <span class="fw-bold small text-danger" *ngIf="!isLoading">{{ dashboard?.unassignedCohorts || 0 }}</span>
                    <div *ngIf="isLoading" class="skeleton-line" style="width:30px;height:16px;border-radius:4px;"></div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center py-1.5">
                    <span class="text-muted small"><i class="bi bi-dot text-secondary fs-5"></i>Completed</span>
                    <span class="fw-bold small" *ngIf="!isLoading">{{ dashboard?.completedCohorts || 0 }}</span>
                    <div *ngIf="isLoading" class="skeleton-line" style="width:30px;height:16px;border-radius:4px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Trainer Availability Stats with Utilization Progress Bar -->
        <div class="col-lg-6">
          <div class="content-card mb-0 h-100">
            <div class="content-card-header">
              <h3 class="content-card-title"><i class="bi bi-people-fill text-success me-2"></i>Trainer Pool Health</h3>
            </div>
            <div class="p-4">
              <!-- Capacity Utilization Gauge -->
              <div class="mb-3.5">
                <div class="d-flex justify-content-between align-items-center small mb-1.5">
                  <span class="text-muted fw-semibold">Pool Capacity Utilization</span>
                  <span class="fw-bold text-dark" *ngIf="!isLoading">{{ trainerUtilizationRate }}% Engaged</span>
                  <div *ngIf="isLoading" class="skeleton-line" style="width:60px;height:16px;border-radius:4px;"></div>
                </div>
                <div class="progress" style="height: 10px; border-radius: 999px; background: #e2e8f0;">
                  <div class="progress-bar bg-danger" [style.width.%]="trainerUtilizationRate" title="Engaged / At Capacity"></div>
                  <div class="progress-bar bg-success" [style.width.%]="100 - trainerUtilizationRate" title="Available"></div>
                </div>
                <div class="d-flex justify-content-between align-items-center small text-muted mt-1" style="font-size: 0.725rem;">
                  <span><i class="bi bi-circle-fill text-danger me-1" style="font-size: 0.45rem;"></i>{{ dashboard?.unavailableTrainers || 0 }} Engaged</span>
                  <span><i class="bi bi-circle-fill text-success me-1" style="font-size: 0.45rem;"></i>{{ dashboard?.availableTrainers || 0 }} Open Capacity</span>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="text-muted">Total Registered Trainers</span>
                <span class="fw-bold fs-6" *ngIf="!isLoading">{{ dashboard?.totalTrainers || 0 }}</span>
                <div *ngIf="isLoading" class="skeleton-line" style="width:30px;height:20px;border-radius:4px;"></div>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="text-muted">Available for Allocation</span>
                <span class="fw-bold fs-6 text-success" *ngIf="!isLoading">{{ dashboard?.availableTrainers || 0 }}</span>
                <div *ngIf="isLoading" class="skeleton-line" style="width:30px;height:20px;border-radius:4px;"></div>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="text-muted">Unavailable / At Capacity</span>
                <span class="fw-bold fs-6 text-danger" *ngIf="!isLoading">{{ dashboard?.unavailableTrainers || 0 }}</span>
                <div *ngIf="isLoading" class="skeleton-line" style="width:30px;height:20px;border-radius:4px;"></div>
              </div>
              <div class="mt-4 pt-1">
                <a routerLink="/admin/trainers" class="btn btn-sm btn-outline-primary w-100">
                  <i class="bi bi-search me-1"></i> Inspect Trainer Workloads &amp; Skills
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    .allocation-donut-wrap {
      width: 120px;
      height: 120px;
      margin: 0 auto;
    }
    .circular-chart {
      display: block;
      margin: 0 auto;
      max-width: 100%;
      max-height: 100%;
    }
    .circle-bg {
      fill: none;
      stroke: #f1f5f9;
      stroke-width: 3.4;
    }
    .circle {
      fill: none;
      stroke-width: 3.4;
      stroke-linecap: round;
      stroke: #10b981;
      transition: stroke-dasharray 0.6s ease;
    }
    .donut-percent {
      fill: #0f172a;
      font-size: 0.55rem;
      text-anchor: middle;
      font-weight: 800;
      font-family: inherit;
      font-variant-numeric: tabular-nums;
    }
    .donut-sublabel {
      fill: #64748b;
      font-size: 0.22rem;
      text-anchor: middle;
      font-weight: 700;
      letter-spacing: 0.05em;
      font-family: inherit;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  dashboard: AdminDashboard | null = null;
  isLoading: boolean = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getDashboard().subscribe({
      next: res => {
        if (res.success) {
          this.dashboard = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get assignedPercent(): number {
    if (!this.dashboard || !this.dashboard.totalCohorts) return 0;
    return Math.round((this.dashboard.assignedCohorts / this.dashboard.totalCohorts) * 100);
  }

  get trainerUtilizationRate(): number {
    if (!this.dashboard || !this.dashboard.totalTrainers) return 0;
    const busy = (this.dashboard.unavailableTrainers != null) 
      ? this.dashboard.unavailableTrainers 
      : (this.dashboard.totalTrainers - this.dashboard.availableTrainers);
    return Math.min(100, Math.max(0, Math.round((busy / this.dashboard.totalTrainers) * 100)));
  }

  exportReport(): void {
    this.adminService.exportAllocationReport().subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TrainMate_Allocation_Report.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }
}
