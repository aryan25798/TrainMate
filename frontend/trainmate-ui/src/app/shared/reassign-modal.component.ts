import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cohort, Trainer } from '../models/models';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reassign-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="cohort">
      <div class="modal-card">
        <div class="modal-header">
          <h5 class="modal-title fs-5 fw-bold mb-0">
            <i class="bi bi-arrow-left-right text-primary me-2"></i>Change Trainer - {{ cohort.cohortCode }}
          </h5>
          <button type="button" class="btn-close" (click)="close.emit()"></button>
        </div>

        <div class="modal-body">
          <!-- Step 1: Selection Form -->
          <div *ngIf="!showConfirm">
            <div class="p-3 bg-light rounded-3 border mb-3">
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">Required Skill:</span>
                <span class="fw-bold">{{ cohort.requiredSkill }}</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">Current Trainer:</span>
                <span class="fw-semibold text-danger">{{ cohort.assignedTrainerName || 'None (Unassigned)' }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Duration:</span>
                <span>{{ cohort.startDate }} to {{ cohort.endDate }}</span>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Select New Trainer <span class="text-danger">*</span></label>
              <select class="form-select" [(ngModel)]="selectedTrainerId">
                <option [ngValue]="null" disabled>-- Choose eligible trainer --</option>
                <option *ngFor="let t of trainers" [ngValue]="t.id" [disabled]="t.id === cohort.assignedTrainerId">
                  {{ t.name }} ({{ t.workloadRatio }} workload) - Skills: {{ t.skills.join(', ') }} [{{ t.status }}]
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Reason for Override</label>
              <input type="text" class="form-control" placeholder="e.g. Trainer specialization or workload balancing" [(ngModel)]="reason" />
            </div>

            <div class="alert alert-danger py-2" *ngIf="errorMessage">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
            </div>
          </div>

          <!-- Step 2: Confirmation Screen (FRD Section 51) -->
          <div *ngIf="showConfirm">
            <div class="alert alert-warning">
              <h6 class="fw-bold mb-2"><i class="bi bi-question-circle-fill me-2"></i>Confirm Reassignment</h6>
              <p class="mb-1">Are you sure you want to reassign this cohort?</p>
              <hr class="my-2">
              <div class="mb-1"><strong>Cohort:</strong> {{ cohort.cohortCode }}</div>
              <div class="mb-1"><strong>Previous Trainer:</strong> {{ cohort.assignedTrainerName || 'Unassigned' }}</div>
              <div class="mb-1"><strong>New Trainer:</strong> {{ getSelectedTrainerName() }}</div>
              <div class="mb-0"><strong>Reason:</strong> {{ reason || 'Admin override' }}</div>
            </div>

            <div class="alert alert-danger py-2" *ngIf="errorMessage">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary-custom" (click)="close.emit()" [disabled]="loading">Cancel</button>

          <button *ngIf="!showConfirm" type="button" class="btn btn-primary-custom" (click)="proceedToConfirm()" [disabled]="!selectedTrainerId || loading">
            Review Reassignment
          </button>

          <button *ngIf="showConfirm" type="button" class="btn btn-outline-secondary" (click)="showConfirm = false" [disabled]="loading">
            Back
          </button>

          <button *ngIf="showConfirm" type="button" class="btn btn-primary-custom" (click)="executeReassign()" [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
            Confirm Reassignment
          </button>
        </div>
      </div>
    </div>
  `
})
export class ReassignModalComponent implements OnInit {
  @Input() cohort: Cohort | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() reassigned = new EventEmitter<Cohort>();

  trainers: Trainer[] = [];
  selectedTrainerId: number | null = null;
  reason: string = '';
  showConfirm: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.adminService.getAllTrainers().subscribe({
      next: res => {
        if (res.success) {
          this.trainers = res.data;
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load trainers.';
      }
    });
  }

  getSelectedTrainerName(): string {
    const t = this.trainers.find(tr => tr.id === this.selectedTrainerId);
    return t ? t.name : 'Unknown';
  }

  proceedToConfirm(): void {
    this.errorMessage = '';
    if (!this.selectedTrainerId) {
      this.errorMessage = 'Please select a trainer.';
      return;
    }
    this.showConfirm = true;
  }

  executeReassign(): void {
    if (!this.cohort || !this.selectedTrainerId) return;

    this.loading = true;
    this.errorMessage = '';

    const adminUserId = this.authService.currentUserValue?.userId || 6;

    this.adminService.reassignTrainer(
      this.cohort.id,
      { trainerId: this.selectedTrainerId, reason: this.reason },
      adminUserId
    ).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.reassigned.emit(res.data);
          this.close.emit();
        } else {
          this.errorMessage = res.message;
        }
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Reassignment failed. Please verify trainer eligibility.';
      }
    });
  }
}
