import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CoachService } from '../../services/coach.service';
import { CohortService } from '../../services/cohort.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Cohort, PagedResponse } from '../../models/models';
import { CohortDetailsModalComponent } from '../../shared/cohort-details-modal.component';
import { CreateCohortModalComponent } from '../../shared/create-cohort-modal.component';
import { EditCohortModalComponent } from '../../shared/edit-cohort-modal.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal.component';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';
import { getInitials } from '../../shared/utils/helpers';
import { ErrorCardComponent } from '../../shared/error-card.component';

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
    StatusBadgePipe,
    ErrorCardComponent
  ],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title d-flex align-items-center gap-2">
            <span>My Managed Cohorts</span>
            <span *ngIf="isRefreshing" class="spinner-border spinner-border-sm text-primary" title="Syncing in background..."></span>
          </h1>
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
                (ngModelChange)="onSearchInput($event)"
              />
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()">
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
              (click)="resetFilters()">
              <i class="bi bi-x-circle me-1"></i>Reset Filters
            </button>
            <span class="text-muted small" *ngIf="pagedData && pagedData.totalElements > 0">
              Showing {{ (pagedData.number || 0) * (pagedData.size || 20) + 1 }} to 
              {{ Math.min((pagedData.number || 0) * (pagedData.size || 20) + (pagedData.numberOfElements || 0), pagedData.totalElements || 0) }} 
              of {{ pagedData.totalElements || 0 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Error State with Retry -->
      <app-error-card
        *ngIf="hasError"
        title="Unable to load cohorts"
        message="A network error occurred or the cloud server is waking up. Click below to retry."
        [isRetrying]="isLoading"
        (retry)="loadCohorts(true)">
      </app-error-card>

      <!-- Cohorts Table -->
      <div class="content-card" *ngIf="!hasError">
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
                <th>Assigned Trainer</th>
                <th class="text-nowrap">Duration</th>
                <th class="text-nowrap">Status</th>
                <th class="text-end text-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Skeleton Loading Rows -->
              <ng-container *ngIf="isLoading && cohorts.length === 0">
                <tr *ngFor="let i of [1,2,3,4,5]">
                  <td class="text-center"><div class="skeleton-shimmer" style="width:16px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:100px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:60px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:110px;height:20px;border-radius:12px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:30px;height:16px;border-radius:4px;"></div></td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="skeleton-shimmer" style="width:28px;height:28px;border-radius:50%;"></div>
                      <div class="skeleton-shimmer" style="width:75px;height:14px;border-radius:4px;"></div>
                    </div>
                  </td>
                  <td><div class="skeleton-shimmer" style="width:80px;height:14px;border-radius:4px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:70px;height:22px;border-radius:6px;"></div></td>
                  <td class="text-end"><div class="skeleton-shimmer" style="width:65px;height:26px;border-radius:6px;"></div></td>
                </tr>
              </ng-container>

              <ng-container *ngIf="cohorts.length > 0">
              <tr *ngFor="let c of cohorts" [class.table-active]="selectedCohortIds.has(c.id)">
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
                <td class="text-nowrap" data-label="Duration">
                  <div class="fw-medium small text-dark">{{ c.startDate }}</div>
                  <small class="text-muted">{{ c.endDate }}</small>
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
                    <button class="action-btn btn-view" (click)="selectedCohort = c" title="View Details" aria-label="View cohort details">
                      <i class="bi bi-eye" aria-hidden="true"></i>
                    </button>
                    <button class="action-btn btn-edit" (click)="editingCohort = c" title="Edit Cohort" aria-label="Edit cohort">
                      <i class="bi bi-pencil" aria-hidden="true"></i>
                    </button>
                    <button
                      class="action-btn btn-reallocate"
                      title="Re-run Allocation"
                      (click)="onReallocate(c)"
                      [disabled]="reallocatingId === c.id"
                      aria-label="Reallocate trainer"
                    >
                      <span *ngIf="reallocatingId === c.id" class="spinner-border spinner-border-sm" style="width: 14px; height: 14px;" aria-hidden="true"></span>
                      <i *ngIf="reallocatingId !== c.id" class="bi bi-arrow-repeat" aria-hidden="true"></i>
                    </button>
                    <button class="action-btn btn-delete" (click)="cohortToDelete = c" title="Delete Cohort" aria-label="Delete cohort">
                      <i class="bi bi-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
              </tr>
              </ng-container>

              <tr *ngIf="!isLoading && cohorts.length === 0">
                <td colspan="9" class="text-center py-5">
                  <div class="d-flex flex-column align-items-center justify-content-center">
                    <i class="bi bi-diagram-3 text-muted opacity-50 mb-2" style="font-size: 2.5rem;"></i>
                    <h6 class="text-dark fw-bold mb-1">No matching cohorts</h6>
                    <p class="text-muted small mb-3">No cohorts match your current search and filter settings.</p>
                    <button class="btn btn-sm btn-outline-primary" *ngIf="searchQuery || statusFilter" (click)="resetFilters()">
                      <i class="bi bi-x-circle me-1"></i> Clear Filters
                    </button>
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
          <div class="d-flex align-items-center gap-2">
            <label class="small text-muted mb-0">Show</label>
            <select class="form-select form-select-sm w-auto" [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange($event)">
              <option [value]="10">10</option>
              <option [value]="20">20</option>
              <option [value]="50">50</option>
              <option [value]="100">100</option>
            </select>
            <label class="small text-muted mb-0">per page</label>
          </div>
          <small class="text-muted">Page {{ (pagedData.number || 0) + 1 }} of {{ pagedData.totalPages || 1 }} ({{ pagedData.totalElements || 0 }} total)</small>
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

    <!-- Edit Cohort Modal -->
    <app-edit-cohort-modal
      *ngIf="editingCohort"
      [cohort]="editingCohort"
      (closed)="editingCohort = null"
      (updated)="onCohortUpdated($event)">
    </app-edit-cohort-modal>

    <!-- Confirm Single Delete Modal -->
    <app-confirm-modal
      *ngIf="cohortToDelete"
      title="Delete Cohort"
      [message]="'Are you sure you want to delete cohort ' + cohortToDelete.cohortCode + '? If a trainer was assigned, their capacity will be released.'"
      confirmText="Yes, Delete Cohort"
      [isDanger]="true"
      (cancel)="cohortToDelete = null"
      (confirm)="confirmDeleteCohort()">
    </app-confirm-modal>

    <!-- Confirm Bulk Delete Modal -->
    <app-confirm-modal
      *ngIf="showBulkDeleteConfirm"
      title="Delete Multiple Cohorts"
      [message]="'Are you sure you want to delete ' + selectedCohortIds.size + ' selected cohort(s)? Any assigned trainers will have their workloads released.'"
      confirmText="Yes, Delete Selected"
      [isDanger]="true"
      (cancel)="showBulkDeleteConfirm = false"
      (confirm)="confirmBulkDelete()">
    </app-confirm-modal>
  `,
  styles: [`
    .skeleton-shimmer {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite ease-in-out;
      display: inline-block;
      vertical-align: middle;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton-shimmer {
        animation: none;
        background: #e2e8f0;
      }
    }
  `]
})
export class CoachCohortsComponent implements OnInit, OnDestroy {
  cohorts: Cohort[] = [];
  searchQuery: string = '';
  statusFilter: string = '';
  isLoading: boolean = true;
  isRefreshing: boolean = false;
  hasError: boolean = false;

  selectedCohort: Cohort | null = null;
  editingCohort: Cohort | null = null;
  cohortToDelete: Cohort | null = null;
  showCreateModal: boolean = false;
  showBulkDeleteConfirm: boolean = false;
  selectedCohortIds: Set<number> = new Set<number>();
  reallocatingId: number | null = null;
  pagedData: PagedResponse<Cohort> | null = null;
  currentPage: number = 0;
  pageSize: number = 20;
  sortBy: string = 'createdDate,desc';

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  protected readonly Math = Math;

  constructor(
    private coachService: CoachService,
    private cohortService: CohortService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // 1. Restore persistent state
    const state = this.coachService.cohortsState;
    this.currentPage = state.page;
    this.pageSize = state.size;
    this.sortBy = state.sort;
    this.searchQuery = state.query;
    this.statusFilter = state.status;

    // 2. Debounced search subscription
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchQuery = term;
      this.currentPage = 0;
      this.syncState();
      this.loadCohorts();
    });

    // 3. Instant cache peek
    const user = this.authService.currentUserValue;
    const coachId = user?.coachId ?? user?.userId;
    if (coachId) {
      const cached = this.coachService.peekCohortsPaged(
        coachId,
        this.searchQuery,
        this.statusFilter,
        undefined,
        this.currentPage,
        this.pageSize,
        this.sortBy
      );
      if (cached && cached.success && cached.data) {
        this.pagedData = cached.data;
        this.cohorts = cached.data.content;
        this.isLoading = false;
        this.isRefreshing = true;
      }
    }

    this.loadCohorts();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSearchInput(val: string): void {
    this.searchSubject.next(val);
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.syncState();
    this.loadCohorts();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.currentPage = 0;
    this.syncState();
    this.loadCohorts();
  }

  private syncState(): void {
    this.coachService.cohortsState = {
      page: this.currentPage,
      size: this.pageSize,
      sort: this.sortBy,
      query: this.searchQuery,
      status: this.statusFilter,
      serviceLine: ''
    };
  }

  loadCohorts(forceRefresh: boolean = false): void {
    const user = this.authService.currentUserValue;
    const coachId = user?.coachId ?? user?.userId;
    if (!coachId) return;

    if (this.cohorts.length === 0) {
      this.isLoading = true;
    } else {
      this.isRefreshing = true;
    }
    this.hasError = false;

    this.coachService.getCohortsPaged(
      coachId,
      this.searchQuery,
      this.statusFilter,
      undefined,
      this.currentPage,
      this.pageSize,
      this.sortBy,
      forceRefresh
    ).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.pagedData = res.data;
          this.cohorts = res.data.content;
          this.selectedCohortIds.clear();
        }
        this.isLoading = false;
        this.isRefreshing = false;
      },
      error: () => {
        this.isLoading = false;
        this.isRefreshing = false;
        if (this.cohorts.length === 0) {
          this.hasError = true;
        }
      }
    });
  }

  onCohortCreated(newCohort: Cohort): void {
    this.loadCohorts(true);
    this.selectedCohort = newCohort;
    this.toastService.success(`Cohort ${newCohort.cohortCode} created & auto-allocated!`);
  }

  onCohortUpdated(updated: Cohort): void {
    this.editingCohort = null;
    this.loadCohorts(true);
  }

  onStatusChange(c: Cohort, newStatus: string): void {
    if (c.status === newStatus) return;
    const prev = c.status;
    c.status = newStatus as any;
    this.cohortService.updateCohortStatus(c.id, newStatus).subscribe({
      next: res => {
        if (res.success) {
          this.toastService.info(`Cohort ${c.cohortCode} status changed to ${newStatus}`);
          this.loadCohorts(true);
        } else {
          c.status = prev;
          this.toastService.error(`Failed to update status.`);
        }
      },
      error: () => {
        c.status = prev;
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
          this.loadCohorts(true);
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

    const previousCohorts = [...this.cohorts];
    this.cohorts = this.cohorts.filter(c => c.id !== id);

    this.cohortService.deleteCohort(id).subscribe({
      next: res => {
        if (res.success) {
          this.toastService.success(`Cohort ${code} deleted and trainer workload capacity released.`);
          this.loadCohorts(true);
        }
      },
      error: () => {
        this.cohorts = previousCohorts;
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
    if (this.isAllSelected()) {
      this.selectedCohortIds.clear();
    } else {
      this.cohorts.forEach(c => this.selectedCohortIds.add(c.id));
    }
  }

  isAllSelected(): boolean {
    return this.cohorts.length > 0 && this.cohorts.every(c => this.selectedCohortIds.has(c.id));
  }

  isPartiallySelected(): boolean {
    const selectedCount = this.cohorts.filter(c => this.selectedCohortIds.has(c.id)).length;
    return selectedCount > 0 && selectedCount < this.cohorts.length;
  }

  confirmBulkDelete(): void {
    const ids = Array.from(this.selectedCohortIds);
    this.showBulkDeleteConfirm = false;
    if (ids.length === 0) return;

    const previousCohorts = [...this.cohorts];
    const previousSelected = new Set(this.selectedCohortIds);
    this.selectedCohortIds.clear();
    this.cohorts = this.cohorts.filter(c => !ids.includes(c.id));

    this.cohortService.bulkDeleteCohorts(ids).subscribe({
      next: res => {
        if (res.success) {
          this.toastService.success(`Successfully deleted ${res.data} cohort(s) and released trainer workloads.`);
          this.loadCohorts(true);
        }
      },
      error: () => {
        this.cohorts = previousCohorts;
        this.selectedCohortIds = previousSelected;
        this.toastService.error(`Failed to delete selected cohorts. Changes were rolled back.`);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.syncState();
    this.loadCohorts();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = Number(size);
    this.currentPage = 0;
    this.syncState();
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

  protected readonly getInitials = getInitials;
}
