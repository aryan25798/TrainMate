import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../services/trainer.service';
import { AuthService } from '../../services/auth.service';
import { Cohort } from '../../models/models';
import { CohortDetailsModalComponent } from '../../shared/cohort-details-modal.component';

@Component({
  selector: 'app-trainer-cohorts',
  standalone: true,
  imports: [CommonModule, FormsModule, CohortDetailsModalComponent],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">My Assigned Cohorts</h1>
          <p class="page-subtitle">Cohorts assigned to your training schedule.</p>
        </div>
      </div>

      <!-- Search & Status Filter (FRD Section 69) -->
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
              />
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" [(ngModel)]="statusFilter">
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div class="col-md-3 text-md-end text-muted small" *ngIf="pagedData">
            Showing {{ (pagedData.number || 0) * (pagedData.size || 15) + 1 }} to 
            {{ Math.min((pagedData.number || 0) * (pagedData.size || 15) + (pagedData.numberOfElements || 0), pagedData.totalElements || 0) }} 
            of {{ pagedData.totalElements || 0 }}
          </div>
          <div class="col-md-3 text-md-end text-muted small" *ngIf="!pagedData">
            Showing {{ filteredCohorts.length }} of {{ cohorts.length }} cohort(s)
          </div>
        </div>
      </div>

      <!-- Table of Cohorts -->
      <div class="content-card">
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
              <tr *ngFor="let c of filteredCohorts">
                <td class="fw-bold text-dark text-nowrap" data-label="Cohort Code">{{ c.cohortCode }}</td>
                <td data-label="Required Skill"><span class="badge-tag">{{ c.requiredSkill }}</span></td>
                <td class="text-nowrap" data-label="Coach">{{ c.coachName || 'N/A' }}</td>
                <td class="text-nowrap" data-label="Trainees">{{ c.numberOfTrainees }}</td>
                <td class="text-nowrap" data-label="Duration">
                  <div class="fw-medium small text-dark">{{ c.startDate }}</div>
                  <small class="text-muted">{{ c.endDate }}</small>
                </td>
                <td class="text-nowrap" data-label="Location">{{ c.location }}</td>
                <td class="text-nowrap" data-label="Status">
                  <span class="badge-status" [ngClass]="getStatusBadgeClass(c.status)">{{ c.status }}</span>
                </td>
                <td class="text-end text-nowrap action-cell" data-label="Action">
                  <div class="action-btn-group">
                    <button class="action-btn btn-view" title="View Cohort Details" (click)="selectedCohort = c" aria-label="View cohort details">
                      <i class="bi bi-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredCohorts.length === 0">
                <td colspan="8" class="text-center py-5">
                  <div class="d-flex flex-column align-items-center justify-content-center">
                    <i class="bi bi-calendar-x text-muted opacity-50 mb-2" style="font-size: 2.5rem;"></i>
                    <h6 class="text-dark fw-bold mb-1">No matching cohorts</h6>
                    <p class="text-muted small mb-3">No cohorts match your current search criteria.</p>
                    <button class="btn btn-sm btn-outline-primary" *ngIf="searchQuery || statusFilter" (click)="searchQuery = ''; statusFilter = ''">
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
        <nav aria-label="Trainer cohorts pagination">
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

    <!-- Cohort Details Modal -->
    <app-cohort-details-modal
      *ngIf="selectedCohort"
      [cohort]="selectedCohort"
      (close)="selectedCohort = null">
    </app-cohort-details-modal>
  `
})
export class TrainerCohortsComponent implements OnInit {
  cohorts: Cohort[] = [];
  searchQuery: string = '';
  statusFilter: string = '';
  selectedCohort: Cohort | null = null;
  pagedData: any = null;
  currentPage: number = 0;
  pageSize: number = 15;
  protected readonly Math = Math;

  constructor(
    private trainerService: TrainerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCohorts();
  }

  loadCohorts(): void {
    const user = this.authService.currentUserValue;
    const trainerId = user?.trainerId;
    if (!trainerId) {
      console.warn('No trainerId found in user session');
      return;
    }
    this.trainerService.getCohortsPaged(trainerId, this.currentPage, this.pageSize).subscribe({
      next: res => {
        if (res.success) {
          this.pagedData = res.data;
          this.cohorts = res.data.content;
        }
      },
      error: () => {
        this.trainerService.getCohorts(trainerId).subscribe({
          next: fallbackRes => {
            if (fallbackRes.success) {
              this.cohorts = fallbackRes.data;
            }
          }
        });
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
        c.requiredSkill.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = !this.statusFilter || c.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ASSIGNED': return 'badge-assigned';
      case 'ACTIVE': return 'badge-active';
      case 'COMPLETED': return 'badge-completed';
      default: return 'badge-secondary';
    }
  }
}
