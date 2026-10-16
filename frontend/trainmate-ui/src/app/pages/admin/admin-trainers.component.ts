import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';
import { Trainer, PagedResponse } from '../../models/models';
import { TrainerFormModalComponent } from '../../shared/trainer-form-modal.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal.component';
import { ErrorCardComponent } from '../../shared/error-card.component';

@Component({
  selector: 'app-admin-trainers',
  standalone: true,
  imports: [CommonModule, FormsModule, TrainerFormModalComponent, ConfirmModalComponent, ErrorCardComponent],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title d-flex align-items-center gap-2">
            <span>Trainers Management</span>
            <span *ngIf="isRefreshing" class="spinner-border spinner-border-sm text-primary" title="Syncing in background..."></span>
          </h1>
          <p class="page-subtitle">Inspect trainer profiles, skill proficiencies, availability, and active workload capacity.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-danger btn-sm"
            *ngIf="selectedTrainerIds.size > 0"
            (click)="showBulkDeleteConfirm = true">
            <i class="bi bi-trash-fill me-1"></i>Delete Selected ({{ selectedTrainerIds.size }})
          </button>
          <button type="button" class="btn btn-primary-custom" (click)="openAddTrainer()">
            <i class="bi bi-person-plus-fill"></i>
            Register New Trainer
          </button>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="content-card p-3 mb-3">
        <div class="row g-3 align-items-center">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-light"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control"
                placeholder="Search by trainer name, skill, or service line..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchInput($event)"
              />
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" [(ngModel)]="statusFilter">
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>
          <div class="col-md-3 text-md-end text-muted small" *ngIf="pagedData && pagedData.totalElements > 0">
            Showing {{ (pagedData.number || 0) * (pagedData.size || 20) + 1 }} to 
            {{ Math.min((pagedData.number || 0) * (pagedData.size || 20) + (pagedData.numberOfElements || 0), pagedData.totalElements || 0) }} 
            of {{ pagedData.totalElements || 0 }}
          </div>
        </div>
      </div>

      <!-- Error State with Retry -->
      <app-error-card
        *ngIf="hasError"
        title="Unable to load trainers"
        message="A network error occurred or the cloud server is waking up. Click below to retry."
        [isRetrying]="isLoading"
        (retry)="loadTrainers(true)">
      </app-error-card>

      <!-- Trainers Table -->
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
                    aria-label="Select all trainers"
                  />
                </th>
                <th class="text-nowrap">Trainer</th>
                <th>Skills</th>
                <th class="text-nowrap">Experience</th>
                <th class="text-nowrap">Availability Window</th>
                <th class="text-nowrap">Workload Capacity</th>
                <th class="text-nowrap">Prev Cohorts</th>
                <th class="text-nowrap">Status</th>
                <th class="text-end text-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Skeleton Loading Rows -->
              <ng-container *ngIf="isLoading && trainers.length === 0">
                <tr *ngFor="let i of [1,2,3,4,5,6]">
                  <td class="text-center"><div class="skeleton-shimmer" style="width:16px;height:16px;border-radius:4px;"></div></td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="skeleton-shimmer" style="width:34px;height:34px;border-radius:50%;"></div>
                      <div>
                        <div class="skeleton-shimmer mb-1" style="width:90px;height:14px;border-radius:4px;"></div>
                        <div class="skeleton-shimmer" style="width:55px;height:12px;border-radius:4px;"></div>
                      </div>
                    </div>
                  </td>
                  <td><div class="skeleton-shimmer" style="width:130px;height:20px;border-radius:12px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:45px;height:14px;border-radius:4px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:85px;height:14px;border-radius:4px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:110px;height:12px;border-radius:6px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:30px;height:18px;border-radius:4px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:75px;height:22px;border-radius:6px;"></div></td>
                  <td class="text-end"><div class="skeleton-shimmer" style="width:65px;height:26px;border-radius:6px;"></div></td>
                </tr>
              </ng-container>

              <ng-container *ngIf="trainers.length > 0">
              <tr *ngFor="let t of displayedTrainers" [class.table-active]="selectedTrainerIds.has(t.id)">
                <td class="text-center" data-label="Select">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    [checked]="selectedTrainerIds.has(t.id)"
                    (change)="toggleSelectTrainer(t.id)"
                    [attr.aria-label]="'Select ' + t.name"
                  />
                </td>
                <td class="text-nowrap" data-label="Trainer">
                  <div class="d-flex align-items-center gap-2">
                    <span class="user-avatar" style="width: 34px; height: 34px; font-size: 0.9rem;">
                      {{ t.name.charAt(0) }}
                    </span>
                    <div>
                      <div class="fw-semibold text-dark" style="font-size: 0.9rem;">{{ t.name }}</div>
                      <small class="text-muted">{{ t.employeeId }}</small>
                    </div>
                  </div>
                </td>
                <td style="min-width: 180px; max-width: 260px;" data-label="Skills">
                  <span class="badge-tag" *ngFor="let s of t.skills">{{ s }}</span>
                </td>
                <td class="text-nowrap" data-label="Experience"><span class="fw-semibold">{{ t.experienceYears }}</span> yrs</td>
                <td class="text-nowrap" data-label="Availability">
                  <div class="fw-medium small text-dark">{{ t.availableFrom }}</div>
                  <small class="text-muted">to {{ t.availableTill }}</small>
                </td>
                <td class="text-nowrap" data-label="Workload">
                  <div class="d-flex align-items-center gap-2" style="min-width: 130px;">
                    <div class="progress flex-grow-1" style="height: 7px; border-radius: 6px; background-color: #f1f5f9;">
                      <div
                        class="progress-bar rounded-pill"
                        [ngClass]="getWorkloadBarClass(t.currentWorkload, t.maximumWorkload)"
                        [style.width.%]="(t.currentWorkload / t.maximumWorkload) * 100">
                      </div>
                    </div>
                    <span class="fw-semibold small text-dark">{{ t.workloadRatio }}</span>
                  </div>
                </td>
                <td class="text-nowrap" data-label="Handled Cohorts"><span class="badge bg-light text-dark border">{{ t.previouslyHandledCohorts }}</span></td>
                <td class="text-nowrap" data-label="Status">
                  <span
                    class="badge-status"
                    [ngClass]="t.status === 'AVAILABLE' ? 'badge-assigned' : 'badge-unassigned'">
                    {{ t.status }}
                  </span>
                </td>
                <td class="text-end text-nowrap action-cell" data-label="Actions">
                  <div class="action-btn-group">
                    <button
                      class="action-btn"
                      [title]="t.status === 'AVAILABLE' ? 'Mark Unavailable' : 'Mark Available'"
                      (click)="toggleAvailability(t)"
                      [attr.aria-label]="t.status === 'AVAILABLE' ? 'Mark Unavailable' : 'Mark Available'">
                      <i class="bi" [ngClass]="t.status === 'AVAILABLE' ? 'bi-toggle-on text-success' : 'bi-toggle-off text-muted'" aria-hidden="true"></i>
                    </button>
                    <button class="action-btn btn-edit" (click)="openEditTrainer(t)" title="Edit Trainer Profile" aria-label="Edit trainer">
                      <i class="bi bi-pencil" aria-hidden="true"></i>
                    </button>
                    <button class="action-btn btn-delete" (click)="trainerToDelete = t" title="Delete Trainer" aria-label="Delete trainer">
                      <i class="bi bi-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
              </tr>
              </ng-container>

              <tr *ngIf="!isLoading && displayedTrainers.length === 0">
                <td colspan="9" class="text-center py-5">
                  <div class="d-flex flex-column align-items-center justify-content-center">
                    <i class="bi bi-person-x text-muted opacity-50 mb-2" style="font-size: 2.5rem;"></i>
                    <h6 class="text-dark fw-bold mb-1">No trainers found</h6>
                    <p class="text-muted small mb-3">No trainers match your search criteria.</p>
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
        <nav aria-label="Trainer pagination">
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

    <!-- Trainer Modal (Add/Edit) -->
    <app-trainer-form-modal
      *ngIf="showTrainerModal"
      [isEdit]="isEditMode"
      [trainer]="selectedTrainerForEdit"
      (closed)="showTrainerModal = false"
      (saved)="onTrainerSaved($event)">
    </app-trainer-form-modal>

    <!-- Delete Single Trainer Modal -->
    <app-confirm-modal
      *ngIf="trainerToDelete"
      title="Delete Trainer"
      [message]="'Are you sure you want to delete ' + trainerToDelete.name + '? Any assigned cohorts will become unassigned and require reassignment.'"
      confirmText="Yes, Delete Trainer"
      [isDanger]="true"
      (cancel)="trainerToDelete = null"
      (confirm)="confirmDeleteTrainer()">
    </app-confirm-modal>

    <!-- Bulk Delete Modal -->
    <app-confirm-modal
      *ngIf="showBulkDeleteConfirm"
      title="Delete Multiple Trainers"
      [message]="'Are you sure you want to delete ' + selectedTrainerIds.size + ' selected trainer(s)? All their cohort assignments will be automatically unassigned.'"
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
export class AdminTrainersComponent implements OnInit, OnDestroy {
  trainers: Trainer[] = [];
  searchQuery: string = '';
  statusFilter: string = '';
  isLoading: boolean = true;
  isRefreshing: boolean = false;
  hasError: boolean = false;

  showTrainerModal: boolean = false;
  selectedTrainerForEdit?: Trainer;
  isEditMode: boolean = false;
  trainerToDelete: Trainer | null = null;

  showBulkDeleteConfirm: boolean = false;
  selectedTrainerIds: Set<number> = new Set<number>();
  pagedData: PagedResponse<Trainer> | null = null;
  currentPage: number = 0;
  pageSize: number = 20;
  sortBy: string = 'id,asc';

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  protected readonly Math = Math;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // 1. Restore state from adminService.trainersState
    const state = this.adminService.trainersState;
    this.currentPage = state.page;
    this.pageSize = state.size;
    this.sortBy = state.sort;
    this.searchQuery = state.search;

    // 2. Setup debounced search subscription
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchQuery = term;
      this.currentPage = 0;
      this.syncState();
      this.loadTrainers();
    });

    // 3. Instant cache peek
    const cached = this.adminService.peekTrainersPaged(
      this.searchQuery,
      this.currentPage,
      this.pageSize,
      this.sortBy
    );
    if (cached && cached.success && cached.data) {
      this.pagedData = cached.data;
      this.trainers = cached.data.content;
      this.isLoading = false;
      this.isRefreshing = true;
    }

    this.loadTrainers();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSearchInput(val: string): void {
    this.searchSubject.next(val);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.currentPage = 0;
    this.syncState();
    this.loadTrainers();
  }

  private syncState(): void {
    this.adminService.trainersState = {
      page: this.currentPage,
      size: this.pageSize,
      sort: this.sortBy,
      search: this.searchQuery
    };
  }

  loadTrainers(forceRefresh: boolean = false): void {
    if (this.trainers.length === 0) {
      this.isLoading = true;
    } else {
      this.isRefreshing = true;
    }
    this.hasError = false;

    this.adminService.getAllTrainersPaged(
      this.searchQuery,
      this.currentPage,
      this.pageSize,
      this.sortBy,
      forceRefresh
    ).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.pagedData = res.data;
          this.trainers = res.data.content;
          this.selectedTrainerIds.clear();
        }
        this.isLoading = false;
        this.isRefreshing = false;
      },
      error: () => {
        this.isLoading = false;
        this.isRefreshing = false;
        if (this.trainers.length === 0) {
          this.hasError = true;
        }
      }
    });
  }

  get displayedTrainers(): Trainer[] {
    if (!this.statusFilter) return this.trainers;
    return this.trainers.filter(t => t.status === this.statusFilter);
  }

  toggleSelectTrainer(id: number): void {
    if (this.selectedTrainerIds.has(id)) {
      this.selectedTrainerIds.delete(id);
    } else {
      this.selectedTrainerIds.add(id);
    }
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedTrainerIds.clear();
    } else {
      this.displayedTrainers.forEach(t => this.selectedTrainerIds.add(t.id));
    }
  }

  isAllSelected(): boolean {
    return this.displayedTrainers.length > 0 && this.displayedTrainers.every(t => this.selectedTrainerIds.has(t.id));
  }

  isPartiallySelected(): boolean {
    const selectedCount = this.displayedTrainers.filter(t => this.selectedTrainerIds.has(t.id)).length;
    return selectedCount > 0 && selectedCount < this.displayedTrainers.length;
  }

  confirmBulkDelete(): void {
    const ids = Array.from(this.selectedTrainerIds);
    this.showBulkDeleteConfirm = false;
    if (ids.length === 0) return;

    const previousTrainers = [...this.trainers];
    const previousSelected = new Set(this.selectedTrainerIds);
    this.selectedTrainerIds.clear();
    this.trainers = this.trainers.filter(t => !ids.includes(t.id));

    this.adminService.bulkDeleteTrainers(ids).subscribe({
      next: res => {
        if (res.success) {
          this.toastService.success(`Successfully deleted ${res.data} trainer(s). Cohort assignments were released.`);
          this.loadTrainers(true);
        }
      },
      error: () => {
        this.trainers = previousTrainers;
        this.selectedTrainerIds = previousSelected;
        this.toastService.error(`Failed to delete selected trainers. Changes were rolled back.`);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.syncState();
    this.loadTrainers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = Number(size);
    this.currentPage = 0;
    this.syncState();
    this.loadTrainers();
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

  openAddTrainer(): void {
    this.isEditMode = false;
    this.selectedTrainerForEdit = undefined;
    this.showTrainerModal = true;
  }

  openEditTrainer(t: Trainer): void {
    this.isEditMode = true;
    this.selectedTrainerForEdit = t;
    this.showTrainerModal = true;
  }

  onTrainerSaved(t: Trainer): void {
    this.showTrainerModal = false;
    this.loadTrainers(true);
  }

  toggleAvailability(t: Trainer): void {
    const newAvail = t.status !== 'AVAILABLE';
    this.adminService.toggleTrainerAvailability(t.id, newAvail).subscribe({
      next: res => {
        if (res.success) {
          this.toastService.info(`Trainer ${t.name} is now ${newAvail ? 'Available' : 'Unavailable'}.`);
          this.loadTrainers(true);
        }
      },
      error: () => {
        this.toastService.error(`Failed to update trainer availability.`);
      }
    });
  }

  confirmDeleteTrainer(): void {
    if (!this.trainerToDelete) return;
    const name = this.trainerToDelete.name;
    const id = this.trainerToDelete.id;
    this.trainerToDelete = null;

    const previousTrainers = [...this.trainers];
    this.trainers = this.trainers.filter(t => t.id !== id);

    this.adminService.deleteTrainer(id).subscribe({
      next: res => {
        if (res.success) {
          this.toastService.success(`Trainer ${name} deleted successfully.`);
          this.loadTrainers(true);
        }
      },
      error: () => {
        this.trainers = previousTrainers;
        this.toastService.error(`Failed to delete trainer.`);
      }
    });
  }

  getWorkloadBarClass(current: number, max: number): string {
    const ratio = current / max;
    if (ratio >= 1.0) return 'bg-danger';
    if (ratio >= 0.7) return 'bg-warning';
    return 'bg-success';
  }
}
