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
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';
import { getInitials } from '../../shared/utils/helpers';

@Component({
  selector: 'app-coach-cohorts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CohortDetailsModalComponent,
    CreateCohortModalComponent,
    EditCohortModalComponent,
    ConfirmModalComponent,
    StatusBadgePipe
  ],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">My Managed Cohorts</h1>
          <p class="page-subtitle">View, edit, reallocate, and monitor cohorts assigned to your coaching portfolio.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-danger btn-sm"
            *ngIf="selectedCohortIds.size > 0"
            (click)="showBulkDeleteConfirm = true">
            <i class="bi bi-trash-fill me-1"></i>Delete Selected ({{ selectedCohortIds.size }})
          </button>
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
          <div class="col-md-4 d-flex justify-content-md-end align-items-center gap-2 flex-wrap">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              *ngIf="searchQuery || statusFilter"
              (click)="searchQuery = ''; statusFilter = ''">
              <i class="bi bi-x-circle me-1"></i>Reset Filters
            </button>
            <span class="text-muted small" *ngIf="pagedData">
              Showing {{ (pagedData.number || 0) * (pagedData.size || 15) + 1 }} to 
              {{ Math.min((pagedData.number || 0) * (pagedData.size || 15) + (pagedData.numberOfElements || 0), pagedData.totalElements || 0) }} 
              of {{ pagedData.totalElements || 0 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Cohorts Table -->
      <div class="content-card">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th style="width: 40px;" class="text-center">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    [checked]="isAllSelected()"
                    [indeterminate]="isPartiallySelected()"
                    (change)="toggleSelectAll()"
                    aria-label="Select all cohorts"
                  />
                </th>
                <th class="text-nowrap">Cohort Code</th>
                <th>Service Line</th>
                <th>Required Skill</th>
                <th class="text-nowrap">Trainees</th>
                <th class="text-nowrap">Duration</th>
                <th>Vertical / Loc</th>
                <th>Assigned Trainer</th>
                <th class="text-nowrap">Status</th>
                <th class="text-end text-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filteredCohorts" [class.table-active]="selectedCohortIds.has(c.id)">
                <td class="text-center" data-label="Select">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    [checked]="selectedCohortIds.has(c.id)"
                    (change)="toggleSelectCohort(c.id)"
                    [attr.aria-label]="'Select ' + c.cohortCode"
                  />
                </td>
                <td class="fw-bold text-dark text-nowrap" data-label="Cohort Code">{{ c.cohortCode }}</td>
                <td class="text-nowrap" data-label="Service Line">{{ c.serviceLine }}</td>
                <td data-label="Required Skill"><span class="badge-tag">{{ c.requiredSkill }}</span></td>
                <td class="text-nowrap" data-label="Trainees">{{ c.numberOfTrainees }}</td>
                <td class="text-nowrap" data-label="Duration">
                  <div class="fw-medium small text-dark">{{ c.startDate }}</div>
                  <small class="text-muted">{{ c.endDate }}</small>
                </td>
                <td class="text-nowrap" data-label="Vertical / Location">{{ c.vertical }} - {{ c.location }}</td>
                <td class="text-nowrap" data-label="Assigned Trainer">
                  <div *ngIf="c.assignedTrainerName" class="d-flex align-items-center gap-2">
                    <span class="trainer-avatar">{{ getInitials(c.assignedTrainerName) }}</span>
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
                <td class="text-nowrap" data-label="Status">
                  <select
                    class="status-select"
                    [ngClass]="'status-' + (c.status | statusBadge)"
                    [ngModel]="c.status"
                    (ngModelChange)="onStatusChange(c, $event)"
                    [attr.aria-label]="'Change status for cohort ' + c.cohortCode"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
                <td class="text-end text-nowrap action-cell" data-label="Actions">
                  <div class="action-btn-group" role="group" [attr.aria-label]="'Actions for cohort ' + c.cohortCode">
                    <button class="action-btn btn-view" title="View 100-Point Breakdown" (click)="selectedCohort = c" aria-label="View cohort details">
                      <i class="bi bi-eye" aria-hidden="true"></i>
                    </button>
                    <button class="action-btn btn-edit" title="Edit Cohort" (click)="editingCohort = c" aria-label="Edit cohort">
                      <i class="bi bi-pencil" aria-hidden="true"></i>
                    </button>
                    <button
                      class="action-btn btn-reallocate"
                      title="Re-run 100-Point Allocation Engine"
                      (click)="onReallocate(c)"
                      [disabled]="reallocatingId === c.id"
                      aria-label="Reallocate trainer"
                    >
                      <span *ngIf="reallocatingId === c.id" class="spinner-border spinner-border-sm" style="width: 14px; height: 14px;" aria-hidden="true"></span>
                      <i *ngIf="reallocatingId !== c.id" class="bi bi-arrow-repeat" aria-hidden="true"></i>
                    </button>
                    <button class="action-btn btn-delete" title="Delete Cohort" (click)="cohortToDelete = c" aria-label="Delete cohort">
                      <i class="bi bi-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredCohorts.length === 0">
                <td colspan="9" class="text-center py-5">
                  <div class="d-flex flex-column align-items-center justify-content-center">
                    <i class="bi bi-collection text-muted opacity-50 mb-2" style="font-size: 2.5rem;"></i>
                    <h6 class="text-dark fw-bold mb-1">No cohorts found</h6>
                    <p class="text-muted small mb-3">No cohorts match your current search and status filters.</p>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-outline-primary" *ngIf="searchQuery || statusFilter" (click)="searchQuery = ''; statusFilter = ''">
                        <i class="bi bi-x-circle me-1"></i> Clear Filters
                      </button>
                      <button class="btn btn-sm btn-primary-custom" (click)="showCreateModal = true">
                        <i class="bi bi-plus-circle-fill me-1"></i> Create Cohort
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div class="content-card p-3 mt-3" *ngIf="pagedData && pagedData.totalPages > 1">
        <nav aria-label="Cohort pagination">
          <ul class="pagination pagination-sm justify-content-center mb-0">
            <li class="page-item" [class.disabled]="pagedData.first">
              <button class="page-link" (click)="onPageChange(0)" [disabled]="pagedData.first" aria-label="First">
                <i class="bi bi-chevron-double-left" aria-hidden="true"></i>
              </button>
            </li>
            <li class="page-item" [class.disabled]="pagedData.first">
              <button class="page-link" (click)="onPageChange(pagedData.number - 1)" [disabled]="pagedData.first" aria-label="Previous">
                <i class="bi bi-chevron-left" aria-hidden="true"></i>
              </button>
            </li>
            <li class="page-item" *ngFor="let page of getPageNumbers()" [class.active]="page === pagedData.number">
              <button class="page-link" (click)="onPageChange(page)">{{ page + 1 }}</button>
            </li>
            <li class="page-item" [class.disabled]="pagedData.last">
              <button class="page-link" (click)="onPageChange(pagedData.number + 1)" [disabled]="pagedData.last" aria-label="Next">
                <i class="bi bi-chevron-right" aria-hidden="true"></i>
              </button>
            </li>
            <li class="page-item" [class.disabled]="pagedData.last">
              <button class="page-link" (click)="onPageChange(pagedData.totalPages - 1)" [disabled]="pagedData.last" aria-label="Last">
                <i class="bi bi-chevron-double-right" aria-hidden="true"></i>
              </button>
            </li>
          </ul>
        </nav>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <select class="form-select form-select-sm w-auto" [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange($event)" style="width: 80px;">
            <option [ngValue]="10">10</option>
            <option [ngValue]="15">15</option>
            <option [ngValue]="25">25</option>
            <option [ngValue]="50">50</option>
          </select>
          <small class="text-muted">Page {{ pagedData.number + 1 }} of {{ pagedData.totalPages }}</small>
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

    <!-- Confirm Bulk Delete Modal -->
    <app-confirm-modal
      *ngIf="showBulkDeleteConfirm"
      title="Delete Selected Cohorts"
      [message]="'Are you sure you want to permanently delete the ' + selectedCohortIds.size + ' selected cohorts? Any assigned trainer workload capacity will be automatically released back to the pool.'"
      confirmText="Yes, Delete All Selected"
      [isDanger]="true"
      (cancel)="showBulkDeleteConfirm = false"
      (confirm)="confirmBulkDelete()">
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
  showBulkDeleteConfirm: boolean = false;
  selectedCohortIds: Set<number> = new Set<number>();
  reallocatingId: number | null = null;
  pagedData: any = null;
  currentPage: number = 0;
  pageSize: number = 15;
  protected readonly Math = Math;

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
    const user = this.authService.currentUserValue;
    const coachId = user?.coachId ?? user?.userId;
    if (!coachId) return;
    this.coachService.getCohortsPaged(coachId, this.currentPage, this.pageSize).subscribe({
      next: res => {
        if (res.success) {
          this.pagedData = res.data;
          this.cohorts = res.data.content;
          this.selectedCohortIds.clear();
        }
      },
      error: () => {
        // Fallback to unpaged if necessary
        this.coachService.getCohorts(coachId).subscribe({
          next: fallbackRes => {
            if (fallbackRes.success) {
              this.cohorts = fallbackRes.data;
              this.selectedCohortIds.clear();
            }
          }
        });
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

  toggleSelectCohort(id: number): void {
    if (this.selectedCohortIds.has(id)) {
      this.selectedCohortIds.delete(id);
    } else {
      this.selectedCohortIds.add(id);
    }
  }

  toggleSelectAll(): void {
    const cohorts = this.filteredCohorts;
    if (this.isAllSelected()) {
      this.selectedCohortIds.clear();
    } else {
      cohorts.forEach(c => this.selectedCohortIds.add(c.id));
    }
  }

  isAllSelected(): boolean {
    const cohorts = this.filteredCohorts;
    return cohorts.length > 0 && cohorts.every(c => this.selectedCohortIds.has(c.id));
  }

  isPartiallySelected(): boolean {
    const cohorts = this.filteredCohorts;
    const selectedCount = cohorts.filter(c => this.selectedCohortIds.has(c.id)).length;
    return selectedCount > 0 && selectedCount < cohorts.length;
  }

  confirmBulkDelete(): void {
    const ids = Array.from(this.selectedCohortIds);
    this.showBulkDeleteConfirm = false;
    if (ids.length === 0) return;

    this.cohortService.bulkDeleteCohorts(ids).subscribe({
      next: res => {
        if (res.success) {
          this.toastService.success(`Successfully deleted ${res.data} cohort(s) and released trainer workloads.`);
          this.selectedCohortIds.clear();
          this.loadCohorts();
        }
      },
      error: () => {
        this.toastService.error(`Failed to delete selected cohorts.`);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCohorts();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadCohorts();
  }

  getPageNumbers(): number[] {
    if (!this.pagedData) return [];
    const totalPages = this.pagedData.totalPages;
    const currentPage = this.pagedData.number;
    const pages: number[] = [];
    
    const maxPagesToShow = 5;
    let start = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
    let end = Math.min(totalPages, start + maxPagesToShow);
    
    if (end - start < maxPagesToShow) {
      start = Math.max(0, end - maxPagesToShow);
    }
    
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
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

  protected readonly getInitials = getInitials;
}
