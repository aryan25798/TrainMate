import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
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
            <div class="stat-value">{{ dashboard?.totalCohorts || 0 }}</div>
          </div>
          <div class="stat-icon blue">
            <i class="bi bi-folder-fill"></i>
          </div>
        </div>

        <div class="stat-card">
          <div>
            <div class="stat-title">Assigned Cohorts</div>
            <div class="stat-value text-success">{{ dashboard?.assignedCohorts || 0 }}</div>
          </div>
          <div class="stat-icon green">
            <i class="bi bi-check2-circle"></i>
          </div>
        </div>

        <div class="stat-card">
          <div>
            <div class="stat-title">Unassigned Cohorts</div>
            <div class="stat-value text-danger">{{ dashboard?.unassignedCohorts || 0 }}</div>
          </div>
          <div class="stat-icon red">
            <i class="bi bi-exclamation-octagon-fill"></i>
          </div>
        </div>

        <div class="stat-card">
          <div>
            <div class="stat-title">Available Trainers</div>
            <div class="stat-value text-primary">{{ dashboard?.availableTrainers || 0 }} / {{ dashboard?.totalTrainers || 0 }}</div>
          </div>
          <div class="stat-icon purple">
            <i class="bi bi-person-badge-fill"></i>
          </div>
        </div>
      </div>

      <!-- Detailed Statistics (FRD Section 48) -->
      <div class="row g-4 mb-4">
        <!-- Cohort Lifecycle Stats -->
        <div class="col-lg-6">
          <div class="content-card mb-0 h-100">
            <div class="content-card-header">
              <h3 class="content-card-title"><i class="bi bi-pie-chart-fill text-primary me-2"></i>Cohort Distribution</h3>
            </div>
            <div class="p-4">
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="text-muted"><i class="bi bi-dot text-primary fs-4"></i>Active (In Progress)</span>
                <span class="fw-bold fs-6">{{ dashboard?.activeCohorts || 0 }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="text-muted"><i class="bi bi-dot text-warning fs-4"></i>Pending Allocation</span>
                <span class="fw-bold fs-6">{{ dashboard?.pendingCohorts || 0 }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="text-muted"><i class="bi bi-dot text-success fs-4"></i>Assigned</span>
                <span class="fw-bold fs-6 text-success">{{ dashboard?.assignedCohorts || 0 }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="text-muted"><i class="bi bi-dot text-danger fs-4"></i>Unassigned</span>
                <span class="fw-bold fs-6 text-danger">{{ dashboard?.unassignedCohorts || 0 }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2">
                <span class="text-muted"><i class="bi bi-dot text-secondary fs-4"></i>Completed</span>
                <span class="fw-bold fs-6">{{ dashboard?.completedCohorts || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Trainer Availability Stats -->
        <div class="col-lg-6">
          <div class="content-card mb-0 h-100">
            <div class="content-card-header">
              <h3 class="content-card-title"><i class="bi bi-people-fill text-success me-2"></i>Trainer Pool Health</h3>
            </div>
            <div class="p-4">
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="text-muted">Total Registered Trainers</span>
                <span class="fw-bold fs-6">{{ dashboard?.totalTrainers || 0 }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="text-muted">Available for Allocation</span>
                <span class="fw-bold fs-6 text-success">{{ dashboard?.availableTrainers || 0 }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span class="text-muted">Unavailable / At Capacity</span>
                <span class="fw-bold fs-6 text-danger">{{ dashboard?.unavailableTrainers || 0 }}</span>
              </div>
              <div class="mt-4 pt-2">
                <a routerLink="/admin/trainers" class="btn btn-sm btn-outline-primary w-100">
                  <i class="bi bi-search me-1"></i> Inspect Trainer Workloads & Skills
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  dashboard: AdminDashboard | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getDashboard().subscribe({
      next: res => {
        if (res.success) {
          this.dashboard = res.data;
        }
      }
    });
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
