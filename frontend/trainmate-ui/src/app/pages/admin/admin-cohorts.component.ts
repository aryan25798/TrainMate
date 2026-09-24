import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { CohortService } from '../../services/cohort.service';
import { ToastService } from '../../services/toast.service';
import { Cohort, PagedResponse } from '../../models/models';
import { CohortDetailsModalComponent } from '../../shared/cohort-details-modal.component';
import { ReassignModalComponent } from '../../shared/reassign-modal.component';
import { EditCohortModalComponent } from '../../shared/edit-cohort-modal.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal.component';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';
import { getInitials } from '../../shared/utils/helpers';

@Component({
  selector: 'app-admin-cohorts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CohortDetailsModalComponent,
    ReassignModalComponent,
    EditCohortModalComponent,
    ConfirmModalComponent,
    StatusBadgePipe
  ],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">All System Cohorts</h1>
          <p class="page-subtitle">Master list of cohorts, allocation scores, and trainer assignments across all academy streams.</p>
        </div>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-secondary-custom" (click)="exportFilteredCsv()" title="Export filtered cohorts to CSV">
            <i class="bi bi-file-earmark-arrow-down text-primary"></i>
            Export CSV
          </button>
          <button type="button" class="btn btn-secondary-custom" (click)="exportReport()" title="Export complete database report as Excel">
            <i class="bi bi-file-earmark-excel-fill text-success"></i>
            Full Report (.xlsx)
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
              <option value="PROCESSING">Processing</option>
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
          <div class="col-md-4 text-md-end text-muted small" *ngIf="pagedData">
            Showing {{ (pagedData.number || 0) * (pagedData.size || 20) + 1 }} to 
            {{ Math.min((pagedData.number || 0) * (pagedData.size || 20) + (pagedData.numberOfElements || 0), pagedData.totalElements || 0) }} 
            of {{ pagedData.totalElements || 0 }} cohort(s)
          </div>
        </div>
      </div>

      <!-- Cohorts Table -->
      <div class="content-card">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th class="text-nowrap sortable-th" (click)="sort('cohortCode')">
                  Cohort Code
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('cohortCode')"></i></span>
                </th>
                <th class="sortable-th" (click)="sort('serviceLine')">
                  Service Line
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('serviceLine')"></i></span>
                </th>
                <th class="sortable-th" (click)="sort('requiredSkill')">
                  Required Skill
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('requiredSkill')"></i></span>
                </th>
                <th class="text-nowrap sortable-th" (click)="sort('numberOfTrainees')">
                  Trainees
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('numberOfTrainees')"></i></span>
                </th>
                <th class="text-nowrap sortable-th" (click)="sort('coachName')">
                  Coach
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('coachName')"></i></span>
                </th>
                <th class="sortable-th" (click)="sort('assignedTrainerName')">
                  Assigned Trainer
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('assignedTrainerName')"></i></span>
                </th>
                <th class="text-nowrap sortable-th" (click)="sort('startDate')">
                  Duration
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('startDate')"></i></span>
                </th>
                <th class="text-nowrap sortable-th" (click)="sort('status')">
                  Status
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('status')"></i></span>
                </th>
                <th class="text-end text-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filteredCohorts">
                <td class="fw-bold text-dark text-nowrap" data-label="Cohort Code">{{ c.cohortCode }}</td>
                <td class="text-nowrap" data-label="Service Line">{{ c.serviceLine }}</td>
                <td data-label="Required Skill"><span class="badge-tag">{{ c.requiredSkill }}</span></td>
                <td class="text-nowrap" data-label="Trainees">{{ c.numberOfTrainees }}</td>
                <td class="text-nowrap" data-label="Coach"><span class="fw-semibold text-dark">{{ c.coachName || 'Unknown' }}</span></td>
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
                    <button class="action-btn btn-view" (click)="selectedCohortForDetails = c" title="View Details & Score Breakdown" aria-label="View cohort details">
                      <i class="bi bi-eye" aria-hidden="true"></i>
                    </button>
                    <button class="action-btn btn-reassign" (click)="selectedCohortForReassign = c" title="Manual Trainer Reassignment" aria-label="Reassign trainer">
                      <i class="bi bi-arrow-left-right" aria-hidden="true"></i>
                    </button>
                    <button class="action-btn btn-edit" (click)="editingCohort = c" title="Edit Cohort" aria-label="Edit cohort">
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
                    <button class="action-btn btn-delete" (click)="cohortToDelete = c" title="Delete Cohort" aria-label="Delete cohort">
                      <i class="bi bi-trash" aria-hidden="true"></i>
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

      <!-- Pagination Controls -->
      <div class="content-card p-3" *ngIf="pagedData && pagedData.totalPages > 1">
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
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <small class="text-muted">Page {{ pagedData.number + 1 }} of {{ pagedData.totalPages }}</small>
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
  displayedCohorts: Cohort[] = [];
  pagedData: PagedResponse<Cohort> | null = null;
  searchQuery: string = '';
  statusFilter: string = '';
  serviceLineFilter: string = '';
  serviceLines: string[] = [];
  currentPage: number = 0;
  pageSize: number = 20;
  sortBy: string = 'createdDate,desc';

  selectedCohortForDetails: Cohort | null = null;
  selectedCohortForReassign: Cohort | null = null;
  editingCohort: Cohort | null = null;
  cohortToDelete: Cohort | null = null;
  reallocatingId: number | null = null;

  Math = Math;

  constructor(
    private adminService: AdminService,
    private cohortService: CohortService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCohorts();
  }

  loadCohorts(): void {
    this.adminService.getAllCohortsPaged(this.currentPage, this.pageSize, this.sortBy).subscribe({
      next: res => {
        if (res.success) {
          this.pagedData = res.data;
          this.cohorts = res.data.content;
          this.displayedCohorts = res.data.content;
          this.extractServiceLines();
        }
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
    const previousStatus = c.status;
    c.status = newStatus as any; // optimistic update
    this.cohortService.updateCohortStatus(c.id, newStatus).subscribe({
      next: res => {
        if (res.success) {
          this.toastService.info(`Cohort ${c.cohortCode} status changed to ${newStatus}`);
          this.loadCohorts();
        } else {
          c.status = previousStatus; // rollback
          this.toastService.error(`Failed to update status.`);
        }
      },
      error: (err) => {
        c.status = previousStatus; // rollback optimistic update
        this.toastService.error(err?.error?.message || `Failed to update status.`);
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

  sortField: string = 'cohortCode';
  sortAsc: boolean = true;

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'bi-arrow-down-up text-muted opacity-50';
    return this.sortAsc ? 'bi-sort-up-alt text-primary' : 'bi-sort-down text-primary';
  }

  exportFilteredCsv(): void {
    const list = this.filteredCohorts;
    if (!list || list.length === 0) {
      this.toastService.warning('No cohorts available to export.');
      return;
    }

    const headers = ['Cohort Code', 'Service Line', 'Stream', 'Required Skill', 'Trainees', 'Start Date', 'End Date', 'Coach', 'Assigned Trainer', 'Score', 'Status'];
    const rows = list.map(c => [
      `"${c.cohortCode || ''}"`,
      `"${c.serviceLine || ''}"`,
      `"${c.stream || ''}"`,
      `"${c.requiredSkill || ''}"`,
      c.numberOfTrainees || 0,
      `"${c.startDate || ''}"`,
      `"${c.endDate || ''}"`,
      `"${c.coachName || ''}"`,
      `"${c.assignedTrainerName || 'Unassigned'}"`,
      c.allocationScore || '',
      `"${c.status || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cohorts_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toastService.success(`Exported ${list.length} cohorts to CSV.`);
  }

  get filteredCohorts(): Cohort[] {
    const filtered = this.cohorts.filter(c => {
      const matchesSearch = !this.searchQuery ||
        c.cohortCode.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.requiredSkill.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (c.coachName && c.coachName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (c.assignedTrainerName && c.assignedTrainerName.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesStatus = !this.statusFilter || c.status === this.statusFilter;
      const matchesSL = !this.serviceLineFilter || c.serviceLine === this.serviceLineFilter;

      return matchesSearch && matchesStatus && matchesSL;
    });

    return filtered.sort((a, b) => {
      let valA: any = (a as any)[this.sortField] ?? '';
      let valB: any = (b as any)[this.sortField] ?? '';

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toString().toLowerCase();
        return this.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (valA < valB) return this.sortAsc ? -1 : 1;
      if (valA > valB) return this.sortAsc ? 1 : -1;
      return 0;
    });
  }

  protected readonly getInitials = getInitials;
}
