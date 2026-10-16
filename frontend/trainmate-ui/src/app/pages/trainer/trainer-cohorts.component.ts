import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TrainerService } from '../../services/trainer.service';
import { AuthService } from '../../services/auth.service';
import { Cohort, PagedResponse } from '../../models/models';
import { CohortDetailsModalComponent } from '../../shared/cohort-details-modal.component';
import { ErrorCardComponent } from '../../shared/error-card.component';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-trainer-cohorts',
  standalone: true,
  imports: [CommonModule, FormsModule, CohortDetailsModalComponent, ErrorCardComponent, StatusBadgePipe],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title d-flex align-items-center gap-2">
            <span>My Assigned Cohorts</span>
            <span *ngIf="isRefreshing" class="spinner-border spinner-border-sm text-primary" title="Syncing in background..."></span>
          </h1>
          <p class="page-subtitle">Cohorts assigned to your training schedule.</p>
        </div>
      </div>

      <!-- Search & Status Filter -->
      <div class="content-card p-3 mb-3">
        <div class="row g-3 align-items-center">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-light"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control"
                placeholder="Search by cohort code or skill..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchInput($event)"
              />
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()">
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
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
        title="Unable to load cohorts"
        message="A network error occurred or the cloud server is waking up. Click below to retry."
        [isRetrying]="isLoading"
        (retry)="loadCohorts(true)">
      </app-error-card>

      <!-- Table of Cohorts -->
      <div class="content-card" *ngIf="!hasError">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th class="text-nowrap">Cohort Code</th>
                <th>Required Skill</th>
                <th class="text-nowrap">Coach</th>
                <th class="text-nowrap">Trainees</th>
                <th class="text-nowrap">Duration</th>
                <th>Location</th>
                <th class="text-nowrap">Status</th>
                <th class="text-end text-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              <!-- Skeleton Loading Rows -->
              <ng-container *ngIf="isLoading && cohorts.length === 0">
                <tr *ngFor="let i of [1,2,3,4,5]">
                  <td><div class="skeleton-shimmer" style="width:100px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:75px;height:20px;border-radius:12px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:90px;height:14px;border-radius:4px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:30px;height:14px;border-radius:4px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:85px;height:14px;border-radius:4px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:80px;height:14px;border-radius:4px;"></div></td>
                  <td><div class="skeleton-shimmer" style="width:75px;height:24px;border-radius:6px;"></div></td>
                  <td class="text-end"><div class="skeleton-shimmer" style="width:32px;height:28px;border-radius:6px;"></div></td>
                </tr>
              </ng-container>

              <ng-container *ngIf="cohorts.length > 0">
              <tr *ngFor="let c of cohorts">
                <td class="fw-bold text-dark text-nowrap" data-label="Cohort Code">{{ c.cohortCode }}</td>
                <td data-label="Required Skill"><span class="badge-tag">{{ c.requiredSkill }}</span></td>
                <td class="text-nowrap" data-label="Coach">{{ c.coachName || 'N/A' }}</td>
                <td class="text-nowrap" data-label="Trainees">{{ c.numberOfTrainees }}</td>
                <td class="text-nowrap" data-label="Duration">
                  <div class="fw-medium small text-dark">{{ c.startDate }}</div>
                  <small class="text-muted">{{ c.endDate }}</small>
                </td>
                <td class="text-nowrap" data-label="Location">{{ c.location || 'Chennai' }}</td>
                <td class="text-nowrap" data-label="Status">
                  <span class="badge-status" [ngClass]="'status-' + (c.status | statusBadge)">
                    {{ c.status }}
                  </span>
                </td>
                <td class="text-end text-nowrap action-cell" data-label="Action">
                  <button class="action-btn btn-view" (click)="selectedCohort = c" title="View Details" aria-label="View cohort details">
                    <i class="bi bi-eye" aria-hidden="true"></i>
                  </button>
                </td>
              </tr>
              </ng-container>

              <tr *ngIf="!isLoading && cohorts.length === 0">
                <td colspan="8" class="text-center py-5">
                  <div class="d-flex flex-column align-items-center justify-content-center">
                    <i class="bi bi-diagram-3 text-muted opacity-50 mb-2" style="font-size: 2.5rem;"></i>
                    <h6 class="text-dark fw-bold mb-1">No cohorts assigned</h6>
                    <p class="text-muted small mb-3">No cohorts match your filter settings.</p>
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
export class TrainerCohortsComponent implements OnInit, OnDestroy {
  cohorts: Cohort[] = [];
  searchQuery: string = '';
  statusFilter: string = '';
  isLoading: boolean = true;
  isRefreshing: boolean = false;
  hasError: boolean = false;
  selectedCohort: Cohort | null = null;
  pagedData: PagedResponse<Cohort> | null = null;
  currentPage: number = 0;
  pageSize: number = 20;
  sortBy: string = 'startDate,asc';

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  protected readonly Math = Math;

  constructor(
    private trainerService: TrainerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1. Restore state
    const state = this.trainerService.cohortsState;
    this.currentPage = state.page;
    this.pageSize = state.size;
    this.sortBy = state.sort;
    this.searchQuery = state.query;
    this.statusFilter = state.status;

    // 2. Debounced search
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
    const trainerId = user?.trainerId;
    if (trainerId) {
      const cached = this.trainerService.peekCohortsPaged(
        trainerId,
        this.searchQuery,
        this.statusFilter,
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
    this.trainerService.cohortsState = {
      page: this.currentPage,
      size: this.pageSize,
      sort: this.sortBy,
      query: this.searchQuery,
      status: this.statusFilter
    };
  }

  loadCohorts(forceRefresh: boolean = false): void {
    const user = this.authService.currentUserValue;
    const trainerId = user?.trainerId;
    if (!trainerId) {
      this.isLoading = false;
      return;
    }

    if (this.cohorts.length === 0) {
      this.isLoading = true;
    } else {
      this.isRefreshing = true;
    }
    this.hasError = false;

    this.trainerService.getCohortsPaged(
      trainerId,
      this.searchQuery,
      this.statusFilter,
      this.currentPage,
      this.pageSize,
      this.sortBy,
      forceRefresh
    ).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.pagedData = res.data;
          this.cohorts = res.data.content;
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
}
