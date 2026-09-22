import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';
import { Trainer } from '../../models/models';
import { TrainerFormModalComponent } from '../../shared/trainer-form-modal.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal.component';

@Component({
  selector: 'app-admin-trainers',
  standalone: true,
  imports: [CommonModule, FormsModule, TrainerFormModalComponent, ConfirmModalComponent],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Trainers Management</h1>
          <p class="page-subtitle">Inspect trainer profiles, skill proficiencies, availability, and active workload capacity.</p>
        </div>
        <div>
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
              />
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" [(ngModel)]="statusFilter">
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
              <option value="AT_CAPACITY">At Capacity</option>
            </select>
          </div>
          <div class="col-md-3 text-md-end text-muted small">
            Showing {{ filteredTrainers.length }} of {{ trainers.length }} trainer(s)
          </div>
        </div>
      </div>

      <!-- Trainers Table -->
      <div class="content-card">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
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
              <tr *ngFor="let t of filteredTrainers">
                <td class="text-nowrap">
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
                <td style="min-width: 180px; max-width: 260px;">
                  <span class="badge-tag" *ngFor="let s of t.skills">{{ s }}</span>
                </td>
                <td class="text-nowrap"><span class="fw-semibold">{{ t.experienceYears }}</span> yrs</td>
                <td class="text-nowrap">
                  <div class="fw-medium small text-dark">{{ t.availableFrom }}</div>
                  <small class="text-muted">to {{ t.availableTill }}</small>
                </td>
                <td class="text-nowrap">
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
                <td class="text-nowrap"><span class="badge bg-light text-dark border">{{ t.previouslyHandledCohorts }}</span></td>
                <td class="text-nowrap">
                  <span
                    class="badge-status"
                    [ngClass]="t.status === 'AVAILABLE' ? 'badge-assigned' : 'badge-unassigned'">
                    {{ t.status }}
                  </span>
                </td>
                <td class="text-end text-nowrap">
                  <div class="action-btn-group">
                    <button class="action-btn btn-edit" (click)="openEditTrainer(t)" title="Edit Trainer Details">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="action-btn"
                      [ngClass]="t.status === 'AVAILABLE' ? 'btn-reallocate' : 'btn-view'"
                      (click)="toggleAvailability(t)"
                      [title]="t.status === 'AVAILABLE' ? 'Deactivate (Set Unavailable)' : 'Activate (Set Available)'"
                    >
                      <i class="bi" [ngClass]="t.status === 'AVAILABLE' ? 'bi-pause-circle' : 'bi-play-circle'"></i>
                    </button>
                    <button class="action-btn btn-delete" (click)="trainerToDelete = t" title="Delete Trainer">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
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

    <!-- Add / Edit Trainer Modal -->
    <app-trainer-form-modal
      *ngIf="showTrainerModal"
      [trainer]="selectedTrainerForEdit"
      [isEdit]="isEditMode"
      (closed)="showTrainerModal = false"
      (saved)="onTrainerSaved($event)">
    </app-trainer-form-modal>

    <!-- Delete Trainer Confirm Modal -->
    <app-confirm-modal
      *ngIf="trainerToDelete"
      title="Delete Trainer"
      [message]="'Are you sure you want to remove trainer ' + trainerToDelete.name + '? Any cohorts currently assigned to this trainer will be set to UNASSIGNED.'"
      confirmText="Yes, Delete Trainer"
      [isDanger]="true"
      (cancel)="trainerToDelete = null"
      (confirm)="confirmDeleteTrainer()">
    </app-confirm-modal>
  `
})
export class AdminTrainersComponent implements OnInit {
  trainers: Trainer[] = [];
  searchQuery: string = '';
  statusFilter: string = '';

  showTrainerModal: boolean = false;
  selectedTrainerForEdit?: Trainer;
  isEditMode: boolean = false;
  trainerToDelete: Trainer | null = null;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadTrainers();
  }

  loadTrainers(): void {
    this.adminService.getAllTrainers().subscribe({
      next: res => {
        if (res.success) {
          this.trainers = res.data;
        }
      }
    });
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
    this.loadTrainers();
  }

  toggleAvailability(t: Trainer): void {
    const newAvail = t.status !== 'AVAILABLE';
    this.adminService.toggleTrainerAvailability(t.id, newAvail).subscribe({
      next: res => {
        if (res.success) {
          this.toastService.info(`Trainer ${t.name} is now ${newAvail ? 'Available' : 'Unavailable'}.`);
          this.loadTrainers();
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

    this.adminService.deleteTrainer(id).subscribe({
      next: res => {
        if (res.success) {
          this.toastService.success(`Trainer ${name} deleted successfully.`);
          this.loadTrainers();
        }
      },
      error: () => {
        this.toastService.error(`Failed to delete trainer.`);
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
