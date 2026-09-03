import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Trainer } from '../../models/models';

@Component({
  selector: 'app-admin-trainers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Trainers Management</h1>
          <p class="page-subtitle">Inspect trainer profiles, skill proficiencies, availability, and active workload capacity.</p>
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
              />
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" [(ngModel)]="statusFilter">
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div class="col-md-3 text-md-end text-muted small">
            Showing {{ filteredTrainers.length }} of {{ trainers.length }} trainer(s)
          </div>
        </div>
      </div>

      <!-- Trainers Table (FRD Section 50) -->
      <div class="content-card">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th>Trainer</th>
                <th>Skills</th>
                <th>Service Line / Vert</th>
                <th>Experience</th>
                <th>Availability Window</th>
                <th>Workload Capacity</th>
                <th>Prev Cohorts</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of filteredTrainers">
                <td>
                  <div class="d-flex align-items-center gap-2.5">
                    <div class="user-avatar" style="width: 36px; height: 36px; font-size: 0.95rem; border-radius: 10px;">
                      {{ t.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="fw-bold text-dark" style="font-size: 0.95rem;">{{ t.name }}</div>
                      <small class="text-muted">{{ t.employeeId }}</small>
                    </div>
                  </div>
                </td>
                <td style="max-width: 250px;">
                  <span class="badge-tag" *ngFor="let s of t.skills">{{ s }}</span>
                </td>
                <td>{{ t.serviceLine }} <small class="text-muted d-block">{{ t.vertical }}</small></td>
                <td><span class="fw-semibold">{{ t.experienceYears }}</span> yrs</td>
                <td>
                  <small class="d-block">{{ t.availableFrom }}</small>
                  <small class="text-muted">to {{ t.availableTill }}</small>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height: 8px;">
                      <div
                        class="progress-bar"
                        [ngClass]="getWorkloadBarClass(t.currentWorkload, t.maximumWorkload)"
                        [style.width.%]="(t.currentWorkload / t.maximumWorkload) * 100">
                      </div>
                    </div>
                    <span class="fw-semibold small">{{ t.workloadRatio }}</span>
                  </div>
                </td>
                <td><span class="badge bg-light text-dark border">{{ t.previouslyHandledCohorts }}</span></td>
                <td>
                  <span
                    class="badge"
                    [ngClass]="t.status === 'AVAILABLE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                    {{ t.status }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="filteredTrainers.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  No matching trainers found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminTrainersComponent implements OnInit {
  trainers: Trainer[] = [];
  searchQuery: string = '';
  statusFilter: string = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAllTrainers().subscribe({
      next: res => {
        if (res.success) {
          this.trainers = res.data;
        }
      }
    });
  }

  get filteredTrainers(): Trainer[] {
    return this.trainers.filter(t => {
      const q = this.searchQuery.toLowerCase();
      const matchesSearch = !this.searchQuery ||
        t.name.toLowerCase().includes(q) ||
        t.serviceLine.toLowerCase().includes(q) ||
        t.skills.some(s => s.toLowerCase().includes(q));

      const matchesStatus = !this.statusFilter || t.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  getWorkloadBarClass(current: number, max: number): string {
    const ratio = current / max;
    if (ratio >= 1.0) return 'bg-danger';
    if (ratio >= 0.7) return 'bg-warning';
    return 'bg-success';
  }
}
