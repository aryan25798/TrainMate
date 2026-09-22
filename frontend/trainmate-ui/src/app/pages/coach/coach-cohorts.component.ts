import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoachService } from '../../services/coach.service';
import { CohortService } from '../../services/cohort.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Cohort } from '../../models/models';
import { CohortDetailsModalComponent } from '../../shared/cohort-details-modal.component';
import { CreateCohortModalComponent } from '../../shared/create-cohort-modal.component';
import { EditCohortModalComponent } from '../../shared/edit-cohort-modal.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal.component';

@Component({
  selector: 'app-coach-cohorts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CohortDetailsModalComponent,
    CreateCohortModalComponent,
    EditCohortModalComponent,
    ConfirmModalComponent
  ],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">My Managed Cohorts</h1>
          <p class="page-subtitle">View, edit, reallocate, and monitor cohorts assigned to your coaching portfolio.</p>
        </div>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-primary-custom" (click)="showCreateModal = true">
            <i class="bi bi-plus-circle-fill"></i>
            Create Cohort
          </button>
        </div>
      </div>

      <!-- Filters & Search Bar -->
      <div class="content-card p-3 mb-3">
        <div class="row g-3 align-items-center">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-light"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control"
                placeholder="Search by cohort code, skill, or trainer..."
                [(ngModel)]="searchQuery"
              />
            </div>
          </div>
          <div class="col-md-3">
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
                <th>Trainees</th>
                <th>Duration</th>
                <th>Vertical / Loc</th>
                <th>Assigned Trainer</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filteredCohorts">
                <td class="fw-bold text-dark">{{ c.cohortCode }}</td>
                <td>{{ c.serviceLine }}</td>
                <td><span class="badge-tag">{{ c.requiredSkill }}</span></td>
                <td>{{ c.numberOfTrainees }}</td>
                <td>
                  <small class="d-block">{{ c.startDate }}</small>
                  <small class="text-muted">{{ c.endDate }}</small>
                </td>
                <td>{{ c.vertical }} - {{ c.location }}</td>
                <td>
                  <div *ngIf="c.assignedTrainerName" class="d-flex align-items-center gap-2">
                    <div class="user-avatar" style="width: 30px; height: 30px; font-size: 0.8rem; border-radius: 8px;">
                      {{ c.assignedTrainerName.charAt(0) }}
                    </div>
                    <div>
                      <div class="fw-bold text-primary" style="font-size: 0.9rem;">{{ c.assignedTrainerName }}</div>
                      <span *ngIf="c.allocationScore" class="badge bg-success-subtle text-success border border-success-subtle px-1.5 py-0" style="font-size: 0.7rem;">
                        {{ c.allocationScore }} pts
                      </span>
                    </div>
                  </div>
                  <span *ngIf="!c.assignedTrainerName" class="badge-status badge-unassigned">
                    Unassigned
                  </span>
                </td>
                <td>
                  <div class="dropdown d-inline-block">
                    <select
                      class="form-select form-select-sm fw-semibold"
                      style="width: 125px; font-size: 11.5px; border-radius: 8px;"
                      [ngModel]="c.status"
                      (ngModelChange)="onStatusChange(c, $event)"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </td>
                <td class="text-end">
                  <div class="d-flex justify-content-end gap-1">
                    <button class="btn btn-sm btn-outline-primary" title="View 100-Point Breakdown" (click)="selectedCohort = c">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" title="Edit Cohort" (click)="editingCohort = c">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-warning"
                      title="Re-run 100-Point Allocation Engine"
                      (click)="onReallocate(c)"
                      [disabled]="reallocatingId === c.id"
                    >
                      <span *ngIf="reallocatingId === c.id" class="spinner-border spinner-border-sm"></span>
                      <i *ngIf="reallocatingId !== c.id" class="bi bi-arrow-repeat"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Delete Cohort" (click)="cohortToDelete = c">
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
      [message]="'Are you sure you want to delete cohort ' + cohortToDelete.cohortCode + '? If a trainer was assigned, their workload capacity will be automatically released back to the pool.'"
      confirmText="Yes, Delete Cohort"
      [isDanger]="true"
      (cancel)="cohortToDelete = null"
      (confirm)="confirmDeleteCohort()">
    </app-confirm-modal>
  `
})
export class CoachCohortsComponent implements OnInit {
  cohorts: Cohort[] = [];
  searchQuery: string = '';
  statusFilter: string = '';
  selectedCohort: Cohort | null = null;
  editingCohort: Cohort | null = null;
  cohortToDelete: Cohort | null = null;
  showCreateModal: boolean = false;
  reallocatingId: number | null = null;

  constructor(
    private coachService: CoachService,
    private cohortService: CohortService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCohorts();
  }

  loadCohorts(): void {
    const coachId = this.authService.currentUserValue?.coachId || 1;
    this.coachService.getCohorts(coachId).subscribe({
      next: res => {
        if (res.success) {
          this.cohorts = res.data;
        }
      }
    });
  }

  onCohortCreated(newCohort: Cohort): void {
    this.loadCohorts();
    this.selectedCohort = newCohort;
    this.toastService.success(`Cohort ${newCohort.cohortCode} created & auto-allocated!`);
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
          this.selectedCohort = res.data;
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
          this.toastService.success(`Cohort ${code} deleted and trainer workload capacity released.`);
          this.loadCohorts();
        }
      },
      error: () => {
        this.toastService.error(`Failed to delete cohort.`);
      }
    });
  }

  get filteredCohorts(): Cohort[] {
    return this.cohorts.filter(c => {
      const matchesSearch = !this.searchQuery ||
        c.cohortCode.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.requiredSkill.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (c.assignedTrainerName && c.assignedTrainerName.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesStatus = !this.statusFilter || c.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }
}
