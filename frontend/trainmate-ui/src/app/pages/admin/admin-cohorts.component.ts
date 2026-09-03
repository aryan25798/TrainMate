import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Cohort } from '../../models/models';
import { CohortDetailsModalComponent } from '../../shared/cohort-details-modal.component';
import { ReassignModalComponent } from '../../shared/reassign-modal.component';

@Component({
  selector: 'app-admin-cohorts',
  standalone: true,
  imports: [CommonModule, FormsModule, CohortDetailsModalComponent, ReassignModalComponent],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">All System Cohorts</h1>
          <p class="page-subtitle">Master list of cohorts, allocation scores, and trainer assignments.</p>
        </div>
        <div>
          <button type="button" class="btn btn-secondary-custom" (click)="exportReport()">
            <i class="bi bi-file-earmark-excel-fill text-success"></i>
            Export Allocation Report
          </button>
        </div>
      </div>

      <!-- Filters & Multi-Search Bar (FRD Section 69) -->
      <div class="content-card p-3 mb-3">
        <div class="row g-3 align-items-center">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-light"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control"
                placeholder="Search code, skill, coach, trainer..."
                [(ngModel)]="searchQuery"
              />
            </div>
          </div>
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="statusFilter">
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="UNASSIGNED">Unassigned</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="serviceLineFilter">
              <option value="">All Service Lines</option>
              <option *ngFor="let sl of serviceLines" [value]="sl">{{ sl }}</option>
            </select>
          </div>
          <div class="col-md-4 text-md-end text-muted small">
            Showing {{ filteredCohorts.length }} of {{ cohorts.length }} cohort(s)
          </div>
        </div>
      </div>

      <!-- Cohorts Table -->
      <div class="content-card">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th>Cohort Code</th>
                <th>Service Line</th>
                <th>Required Skill</th>
                <th>Coach</th>
                <th>Assigned Trainer</th>
                <th>Score</th>
                <th>Start / End</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filteredCohorts">
                <td class="fw-bold text-dark">{{ c.cohortCode }}</td>
                <td>{{ c.serviceLine }}</td>
                <td><span class="badge-tag">{{ c.requiredSkill }}</span></td>
                <td>{{ c.coachName || 'N/A' }}</td>
                <td>
                  <div *ngIf="c.assignedTrainerName" class="d-flex align-items-center gap-2">
                    <div class="user-avatar" style="width: 28px; height: 28px; font-size: 0.75rem; border-radius: 8px;">
                      {{ c.assignedTrainerName.charAt(0) }}
                    </div>
                    <span class="fw-semibold text-primary">{{ c.assignedTrainerName }}</span>
                  </div>
                  <span *ngIf="!c.assignedTrainerName" class="badge-status badge-unassigned">
                    Unassigned
                  </span>
                </td>
                <td>
                  <span *ngIf="c.allocationScore !== undefined && c.allocationScore !== null" class="badge bg-success-subtle text-success fw-bold">
                    {{ c.allocationScore }} / 100
                  </span>
                  <span *ngIf="c.allocationScore === undefined || c.allocationScore === null" class="text-muted">-</span>
                </td>
                <td>
                  <small class="d-block">{{ c.startDate }}</small>
                  <small class="text-muted">{{ c.endDate }}</small>
                </td>
                <td>
                  <span class="badge-status" [ngClass]="getStatusBadgeClass(c.status)">{{ c.status }}</span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" (click)="selectedCohortForDetails = c" title="View Details & Score Breakdown">
                      <i class="bi bi-eye"></i> View
                    </button>
                    <button class="btn btn-outline-secondary" (click)="selectedCohortForReassign = c" title="Change Trainer Override">
                      <i class="bi bi-arrow-left-right text-primary"></i> Change Trainer
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredCohorts.length === 0">
                <td colspan="9" class="text-center py-4 text-muted">
                  No matching cohorts found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Cohort Details Modal with 100-Point Score Breakdown -->
    <app-cohort-details-modal
      *ngIf="selectedCohortForDetails"
      [cohort]="selectedCohortForDetails"
      (close)="selectedCohortForDetails = null">
    </app-cohort-details-modal>

    <!-- Admin Reassignment Modal (FRD Section 51-53) -->
    <app-reassign-modal
      *ngIf="selectedCohortForReassign"
      [cohort]="selectedCohortForReassign"
      (close)="selectedCohortForReassign = null"
      (reassigned)="onCohortReassigned($event)">
    </app-reassign-modal>
  `
})
export class AdminCohortsComponent implements OnInit {
  cohorts: Cohort[] = [];
  searchQuery: string = '';
  statusFilter: string = '';
  serviceLineFilter: string = '';
  serviceLines: string[] = [];

  selectedCohortForDetails: Cohort | null = null;
  selectedCohortForReassign: Cohort | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCohorts();
  }

  loadCohorts(): void {
    this.adminService.getAllCohorts().subscribe({
      next: res => {
        if (res.success) {
          this.cohorts = res.data;
          const slSet = new Set<string>();
          this.cohorts.forEach(c => { if (c.serviceLine) slSet.add(c.serviceLine); });
          this.serviceLines = Array.from(slSet);
        }
      }
    });
  }

  onCohortReassigned(updated: Cohort): void {
    this.loadCohorts();
  }

  get filteredCohorts(): Cohort[] {
    return this.cohorts.filter(c => {
      const q = this.searchQuery.toLowerCase();
      const matchesSearch = !this.searchQuery ||
        c.cohortCode.toLowerCase().includes(q) ||
        c.requiredSkill.toLowerCase().includes(q) ||
        (c.coachName && c.coachName.toLowerCase().includes(q)) ||
        (c.assignedTrainerName && c.assignedTrainerName.toLowerCase().includes(q));

      const matchesStatus = !this.statusFilter || c.status === this.statusFilter;
      const matchesSL = !this.serviceLineFilter || c.serviceLine === this.serviceLineFilter;

      return matchesSearch && matchesStatus && matchesSL;
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
