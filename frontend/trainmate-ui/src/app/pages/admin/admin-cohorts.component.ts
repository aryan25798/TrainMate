import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { CohortService } from '../../services/cohort.service';
import { ToastService } from '../../services/toast.service';
import { Cohort } from '../../models/models';
import { CohortDetailsModalComponent } from '../../shared/cohort-details-modal.component';
import { ReassignModalComponent } from '../../shared/reassign-modal.component';
import { EditCohortModalComponent } from '../../shared/edit-cohort-modal.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal.component';

@Component({
  selector: 'app-admin-cohorts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CohortDetailsModalComponent,
    ReassignModalComponent,
    EditCohortModalComponent,
    ConfirmModalComponent
  ],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">All System Cohorts</h1>
          <p class="page-subtitle">Master list of cohorts, allocation scores, and trainer assignments across all academy streams.</p>
        </div>
        <div>
          <button type="button" class="btn btn-secondary-custom" (click)="exportReport()">
            <i class="bi bi-file-earmark-excel-fill text-success"></i>
            Export Allocation Report
          </button>
        </div>
      </div>

      <!-- Filters & Multi-Search Bar -->
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
              <option value="CANCELLED">Cancelled</option>
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
                <th class="text-nowrap">Cohort Code</th>
                <th>Service Line</th>
                <th>Required Skill</th>
                <th class="text-nowrap">Trainees</th>
                <th class="text-nowrap">Coach</th>
                <th>Assigned Trainer</th>
                <th class="text-nowrap">Duration</th>
                <th class="text-nowrap">Status</th>
                <th class="text-end text-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filteredCohorts">
                <td class="fw-bold text-dark text-nowrap">{{ c.cohortCode }}</td>
                <td class="text-nowrap">{{ c.serviceLine }}</td>
                <td><span class="badge-tag">{{ c.requiredSkill }}</span></td>
                <td class="text-nowrap">{{ c.numberOfTrainees }}</td>
                <td class="text-nowrap">
                  <span class="fw-semibold text-dark">{{ c.coachName || 'Unknown' }}</span>
                </td>
                <td class="text-nowrap">
                  <div *ngIf="c.assignedTrainerName" class="d-flex align-items-center gap-2">
                    <span class="trainer-avatar">{{ c.assignedTrainerName.charAt(0) }}</span>
                    <div>
                      <div class="fw-semibold text-dark" style="font-size: 0.885rem;">{{ c.assignedTrainerName }}</div>
                      <span *ngIf="c.allocationScore" class="badge bg-success-subtle text-success border border-success-subtle px-1.5 py-0" style="font-size: 0.7rem;">
                        {{ c.allocationScore }} pts
                      </span>
                    </div>
                  </div>
                  <span *ngIf="!c.assignedTrainerName" class="badge-status badge-unassigned">
                    Unassigned
                  </span>
                </td>
                <td class="text-nowrap">
                  <div class="fw-medium small text-dark">{{ c.startDate }}</div>
                  <small class="text-muted">{{ c.endDate }}</small>
                </td>
                <td class="text-nowrap">
                  <select
                    class="status-select"
                    [ngClass]="'status-' + c.status.toLowerCase()"
                    [ngModel]="c.status"
                    (ngModelChange)="onStatusChange(c, $event)"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
                <td class="text-end text-nowrap">
                  <div class="action-btn-group">
                    <button class="action-btn btn-view" (click)="selectedCohortForDetails = c" title="View Details & Score Breakdown">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="action-btn btn-reassign" (click)="selectedCohortForReassign = c" title="Manual Trainer Reassignment">
                      <i class="bi bi-arrow-left-right"></i>
                    </button>
                    <button class="action-btn btn-edit" (click)="editingCohort = c" title="Edit Cohort">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="action-btn btn-reallocate"
                      title="Re-run 100-Point Allocation Engine"
                      (click)="onReallocate(c)"
                      [disabled]="reallocatingId === c.id"
                    >
                      <span *ngIf="reallocatingId === c.id" class="spinner-border spinner-border-sm" style="width: 14px; height: 14px;"></span>
                      <i *ngIf="reallocatingId !== c.id" class="bi bi-arrow-repeat"></i>
                    </button>
                    <button class="action-btn btn-delete" (click)="cohortToDelete = c" title="Delete Cohort">
                      <i class="bi bi-trash"></i>
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

    <!-- Admin Reassignment Modal -->
    <app-reassign-modal
      *ngIf="selectedCohortForReassign"
      [cohort]="selectedCohortForReassign"
      (close)="selectedCohortForReassign = null"
      (reassigned)="onCohortReassigned($event)">
    </app-reassign-modal>

    <!-- Edit Cohort Modal -->
    <app-edit-cohort-modal
      *ngIf="editingCohort"
      [cohort]="editingCohort"
      (closed)="editingCohort = null"
      (updated)="onCohortUpdated($event)">
    </app-edit-cohort-modal>

    <!-- Confirm Delete Modal -->
    <app-confirm-modal
      *ngIf="cohortToDelete"
      title="Delete Cohort"
      [message]="'Are you sure you want to delete cohort ' + cohortToDelete.cohortCode + '? If a trainer was assigned, their capacity will be released automatically.'"
      confirmText="Yes, Delete Cohort"
      [isDanger]="true"
      (cancel)="cohortToDelete = null"
      (confirm)="confirmDeleteCohort()">
    </app-confirm-modal>
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
  editingCohort: Cohort | null = null;
  cohortToDelete: Cohort | null = null;
  reallocatingId: number | null = null;

  constructor(
    private adminService: AdminService,
    private cohortService: CohortService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCohorts();
  }

  loadCohorts(): void {
    this.adminService.getAllCohorts().subscribe({
      next: res => {
        if (res.success) {
          this.cohorts = res.data;
          this.extractServiceLines();
        }
      }
    });
  }

  extractServiceLines(): void {
    const sls = new Set<string>();
    this.cohorts.forEach(c => {
      if (c.serviceLine) sls.add(c.serviceLine);
    });
    this.serviceLines = Array.from(sls).sort();
  }

  onCohortReassigned(updatedCohort: Cohort): void {
    this.selectedCohortForReassign = null;
    this.toastService.success(`Trainer reassigned for ${updatedCohort.cohortCode}.`);
    this.loadCohorts();
  }

  onCohortUpdated(updated: Cohort): void {
    this.editingCohort = null;
    this.loadCohorts();
  }

  onStatusChange(c: Cohort, newStatus: string): void {
    if (c.status === newStatus) return;
    this.cohortService.updateCohortStatus(c.id, newStatus).subscribe({
      next: res => {
        if (res.success) {
          c.status = newStatus as any;
          this.toastService.info(`Cohort ${c.cohortCode} status changed to ${newStatus}`);
          this.loadCohorts();
        }
      },
      error: () => {
        this.toastService.error(`Failed to update status.`);
      }
    });
  }

  onReallocate(c: Cohort): void {
    this.reallocatingId = c.id;
    this.cohortService.reallocateTrainer(c.id).subscribe({
      next: res => {
        this.reallocatingId = null;
        if (res.success) {
          this.toastService.success(`Re-allocated ${c.cohortCode}: Assigned to ${res.data.assignedTrainerName || 'Unassigned'}`);
          this.loadCohorts();
          this.selectedCohortForDetails = res.data;
        }
      },
      error: () => {
        this.reallocatingId = null;
        this.toastService.error(`Failed to reallocate trainer.`);
      }
    });
  }

  confirmDeleteCohort(): void {
    if (!this.cohortToDelete) return;
    const code = this.cohortToDelete.cohortCode;
    const id = this.cohortToDelete.id;
    this.cohortToDelete = null;

    this.cohortService.deleteCohort(id).subscribe({
      next: res => {
        if (res.success) {
          this.toastService.success(`Cohort ${code} deleted successfully.`);
          this.loadCohorts();
        }
      },
      error: () => {
        this.toastService.error(`Failed to delete cohort.`);
      }
    });
  }

  exportReport(): void {
    this.adminService.exportAllocationReport().subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cohort_allocations.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success(`Allocation report downloaded.`);
      }
    });
  }

  get filteredCohorts(): Cohort[] {
    return this.cohorts.filter(c => {
      const matchesSearch = !this.searchQuery ||
        c.cohortCode.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.requiredSkill.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (c.coachName && c.coachName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (c.assignedTrainerName && c.assignedTrainerName.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesStatus = !this.statusFilter || c.status === this.statusFilter;
      const matchesSL = !this.serviceLineFilter || c.serviceLine === this.serviceLineFilter;

      return matchesSearch && matchesStatus && matchesSL;
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ASSIGNED': return 'badge-assigned';
      case 'UNASSIGNED': return 'badge-unassigned';
      case 'PENDING': return 'badge-pending';
      case 'ACTIVE': return 'badge-active';
      case 'COMPLETED': return 'badge-completed';
      case 'CANCELLED': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }
}
