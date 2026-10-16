import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminDashboard } from '../../models/models';
import { SkeletonCardComponent } from '../../shared/skeleton/skeleton-card.component';
import { ErrorCardComponent } from '../../shared/error-card.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonCardComponent, ErrorCardComponent],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Admin Dashboard</h1>
          <p class="page-subtitle">Complete system oversight, trainer workloads, and allocation analytics.</p>
        </div>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-secondary-custom" (click)="exportReport()" [disabled]="isLoading || isExporting">
            <span *ngIf="isExporting" class="spinner-border spinner-border-sm me-1 text-success"></span>
            <i *ngIf="!isExporting" class="bi bi-file-earmark-excel-fill text-success"></i>
            {{ isExporting ? 'Exporting...' : 'Export Report' }}
          </button>
          <a routerLink="/admin/cohorts" class="btn btn-primary-custom">
            <i class="bi bi-diagram-3-fill"></i>
            Manage Cohorts
          </a>
        </div>
      </div>

      <!-- Error State with Retry -->
      <app-error-card
        *ngIf="hasError"
        title="Unable to load admin dashboard"
        message="Could not retrieve system statistics. The cloud server may still be initializing."
        [isRetrying]="isLoading"
        (retry)="loadData()">
      </app-error-card>

      <!-- Primary Stat Cards (FRD Section 47) -->
      <div class="stats-grid mb-4" *ngIf="!hasError">
        <ng-container *ngIf="isLoading">
          <app-skeleton-card></app-skeleton-card>
          <app-skeleton-card></app-skeleton-card>
          <app-skeleton-card></app-skeleton-card>
          <app-skeleton-card></app-skeleton-card>
        </ng-container>

        <ng-container *ngIf="!isLoading">
          <div class="stat-card">
            <div>
              <div class="stat-title">Total Cohorts</div>
              <div class="stat-value">{{ dashboard?.totalCohorts || 0 }}</div>
            </div>
            <div class="stat-icon blue"><i class="bi bi-folder-fill"></i></div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-title">Assigned Cohorts</div>
              <div class="stat-value text-success">{{ dashboard?.assignedCohorts || 0 }}</div>
            </div>
            <div class="stat-icon green"><i class="bi bi-check2-circle"></i></div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-title">Unassigned Cohorts</div>
              <div class="stat-value text-danger">{{ dashboard?.unassignedCohorts || 0 }}</div>
            </div>
            <div class="stat-icon red"><i class="bi bi-exclamation-octagon-fill"></i></div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-title">Available Trainers</div>
              <div class="stat-value text-primary">{{ dashboard?.availableTrainers || 0 }} / {{ dashboard?.totalTrainers || 0 }}</div>
            </div>
            <div class="stat-icon purple"><i class="bi bi-person-badge-fill"></i></div>
          </div>
        </ng-container>
      </div>

      <!-- Detailed Statistics (FRD Section 48) -->
      <div class="row g-4 mb-4" *ngIf="!hasError">
        <!-- Cohort Lifecycle Stats -->
        <div class="col-lg-6">
          <div class="content-card mb-0 h-100">
            <div class="content-card-header">
              <h3 class="content-card-title"><i class="bi bi-pie-chart-fill text-primary me-2"></i>Cohort Distribution</h3>
            </div>
            <div class="p-4">
              <div class="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                <span class="text-muted"><i class="bi bi-dot text-primary fs-4"></i>Active (In Progress)</span>
                <span class="fw-bold fs-6" *ngIf="!isLoading">{{ dashboard?.activeCohorts || 0 }}</span>
                <div *ngIf="isLoading" class="skeleton-shimmer" style="width:36px;height:18px;border-radius:4px;"></div>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                <span class="text-muted"><i class="bi bi-dot text-warning fs-4"></i>Pending Allocation</span>
                <span class="fw-bold fs-6" *ngIf="!isLoading">{{ dashboard?.pendingCohorts || 0 }}</span>
                <div *ngIf="isLoading" class="skeleton-shimmer" style="width:36px;height:18px;border-radius:4px;"></div>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                <span class="text-muted"><i class="bi bi-dot text-success fs-4"></i>Assigned</span>
                <span class="fw-bold fs-6 text-success" *ngIf="!isLoading">{{ dashboard?.assignedCohorts || 0 }}</span>
                <div *ngIf="isLoading" class="skeleton-shimmer" style="width:36px;height:18px;border-radius:4px;"></div>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                <span class="text-muted"><i class="bi bi-dot text-danger fs-4"></i>Unassigned</span>
                <span class="fw-bold fs-6 text-danger" *ngIf="!isLoading">{{ dashboard?.unassignedCohorts || 0 }}</span>
                <div *ngIf="isLoading" class="skeleton-shimmer" style="width:36px;height:18px;border-radius:4px;"></div>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2.5">
                <span class="text-muted"><i class="bi bi-dot text-secondary fs-4"></i>Completed</span>
                <span class="fw-bold fs-6" *ngIf="!isLoading">{{ dashboard?.completedCohorts || 0 }}</span>
                <div *ngIf="isLoading" class="skeleton-shimmer" style="width:36px;height:18px;border-radius:4px;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Trainer Availability Breakdown -->
        <div class="col-lg-6">
          <div class="content-card mb-0 h-100">
            <div class="content-card-header">
              <h3 class="content-card-title"><i class="bi bi-people-fill text-purple me-2"></i>Trainer Pool Status</h3>
            </div>
            <div class="p-4">
              <div class="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                <span class="text-muted"><i class="bi bi-dot text-success fs-4"></i>Available for Allocation</span>
                <span class="fw-bold fs-6 text-success" *ngIf="!isLoading">{{ dashboard?.availableTrainers || 0 }}</span>
                <div *ngIf="isLoading" class="skeleton-shimmer" style="width:36px;height:18px;border-radius:4px;"></div>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                <span class="text-muted"><i class="bi bi-dot text-danger fs-4"></i>Unavailable / At Capacity</span>
                <span class="fw-bold fs-6 text-danger" *ngIf="!isLoading">{{ dashboard?.unavailableTrainers || 0 }}</span>
                <div *ngIf="isLoading" class="skeleton-shimmer" style="width:36px;height:18px;border-radius:4px;"></div>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2.5 border-bottom">
                <span class="text-muted"><i class="bi bi-dot text-primary fs-4"></i>Total Registered Trainers</span>
                <span class="fw-bold fs-6" *ngIf="!isLoading">{{ dashboard?.totalTrainers || 0 }}</span>
                <div *ngIf="isLoading" class="skeleton-shimmer" style="width:36px;height:18px;border-radius:4px;"></div>
              </div>
              <div class="mt-4 pt-2">
                <a routerLink="/admin/trainers" class="btn btn-sm btn-outline-primary w-100 py-2">
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
    .skeleton-shimmer {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite ease-in-out;
      display: inline-block;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  dashboard: AdminDashboard | null = null;
  isLoading: boolean = true;
  hasError: boolean = false;
  isExporting: boolean = false;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const cached = this.adminService.peekDashboard();
    if (cached && cached.success && cached.data) {
      this.dashboard = cached.data;
      this.isLoading = false;
    }
    this.loadData();
  }

  loadData(): void {
    if (!this.dashboard) {
      this.isLoading = true;
    }
    this.hasError = false;

    this.adminService.getDashboard().subscribe({
      next: res => {
        if (res.success) {
          this.dashboard = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        if (!this.dashboard) {
          this.hasError = true;
        }
      }
    });
  }

  exportReport(): void {
    this.isExporting = true;
    this.adminService.exportAllocationReport().subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TrainMate_Allocation_Report.xlsx';
        a.click();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        this.isExporting = false;
        this.toastService.success('Allocation report downloaded.');
      },
      error: () => {
        this.isExporting = false;
        this.toastService.error('Failed to export report.');
      }
    });
  }
}
