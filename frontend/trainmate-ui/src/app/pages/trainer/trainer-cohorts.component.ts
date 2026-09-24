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
        <div>
          <button type="button" class="btn btn-secondary-custom" (click)="exportFilteredCsv()" title="Export assigned cohorts to CSV">
            <i class="bi bi-file-earmark-arrow-down text-primary"></i>
            Export CSV
          </button>
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
          <div class="col-md-3 text-md-end text-muted small">
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
                <th class="text-nowrap sortable-th" (click)="sort('cohortCode')">
                  Cohort Code
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('cohortCode')"></i></span>
                </th>
                <th class="sortable-th" (click)="sort('requiredSkill')">
                  Required Skill
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('requiredSkill')"></i></span>
                </th>
                <th class="text-nowrap sortable-th" (click)="sort('coachName')">
                  Coach
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('coachName')"></i></span>
                </th>
                <th class="text-nowrap sortable-th" (click)="sort('numberOfTrainees')">
                  Trainees
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('numberOfTrainees')"></i></span>
                </th>
                <th class="text-nowrap sortable-th" (click)="sort('startDate')">
                  Duration
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('startDate')"></i></span>
                </th>
                <th class="sortable-th" (click)="sort('location')">
                  Location
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('location')"></i></span>
                </th>
                <th class="text-nowrap sortable-th" (click)="sort('status')">
                  Status
                  <span class="sort-icon"><i class="bi" [ngClass]="getSortIcon('status')"></i></span>
                </th>
                <th class="text-end text-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filteredCohorts">
                <td class="fw-bold text-dark text-nowrap">{{ c.cohortCode }}</td>
                <td><span class="badge-tag">{{ c.requiredSkill }}</span></td>
                <td class="text-nowrap">{{ c.coachName || 'N/A' }}</td>
                <td class="text-nowrap">{{ c.numberOfTrainees }}</td>
                <td class="text-nowrap">
                  <div class="fw-medium small text-dark">{{ c.startDate }}</div>
                  <small class="text-muted">{{ c.endDate }}</small>
                </td>
                <td class="text-nowrap">{{ c.location }}</td>
                <td class="text-nowrap">
                  <span class="badge-status" [ngClass]="getStatusBadgeClass(c.status)">{{ c.status }}</span>
                </td>
                <td class="text-end text-nowrap">
                  <div class="action-btn-group">
                    <button class="action-btn btn-view" title="View Cohort Details" (click)="selectedCohort = c">
                      <i class="bi bi-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredCohorts.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  No matching assigned cohorts found.
                </td>
              </tr>
            </tbody>
          </table>
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

  constructor(
    private trainerService: TrainerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    const trainerId = user?.trainerId;
    if (!trainerId) {
      console.warn('No trainerId found in user session');
      return;
    }
    this.trainerService.getCohorts(trainerId).subscribe({
      next: res => {
        if (res.success) {
          this.cohorts = res.data;
        }
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
    if (!list || list.length === 0) return;

    const headers = ['Cohort Code', 'Required Skill', 'Coach', 'Trainees', 'Start Date', 'End Date', 'Location', 'Status'];
    const rows = list.map(c => [
      `"${c.cohortCode || ''}"`,
      `"${c.requiredSkill || ''}"`,
      `"${c.coachName || ''}"`,
      c.numberOfTrainees || 0,
      `"${c.startDate || ''}"`,
      `"${c.endDate || ''}"`,
      `"${c.location || ''}"`,
      `"${c.status || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_assigned_cohorts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  get filteredCohorts(): Cohort[] {
    const filtered = this.cohorts.filter(c => {
      const matchesSearch = !this.searchQuery ||
        c.cohortCode.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.requiredSkill.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = !this.statusFilter || c.status === this.statusFilter;

      return matchesSearch && matchesStatus;
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

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ASSIGNED': return 'badge-assigned';
      case 'ACTIVE': return 'badge-active';
      case 'COMPLETED': return 'badge-completed';
      default: return 'badge-secondary';
    }
  }
}
