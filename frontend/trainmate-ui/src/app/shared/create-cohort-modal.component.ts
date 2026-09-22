import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoachService } from '../services/coach.service';
import { AuthService } from '../services/auth.service';
import { Cohort, CreateCohortRequest } from '../models/models';

@Component({
  selector: 'app-create-cohort-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-plus-circle-fill text-primary fs-5"></i>
            <h5 class="modal-title fs-5 fw-bold mb-0">Create New Cohort</h5>
          </div>
          <button type="button" class="btn-close" (click)="close.emit()" [disabled]="loading"></button>
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="modal-body">
            <!-- Alert error if any -->
            <div class="alert alert-danger py-2 small" *ngIf="errorMessage">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
            </div>

            <!-- Form Fields in 2-column grid -->
            <div class="row g-3">
              <!-- Cohort Code -->
              <div class="col-md-7">
                <label class="form-label fw-semibold small">Cohort Code <span class="text-danger">*</span></label>
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. QEA26SD010"
                    [(ngModel)]="formData.cohortCode"
                    name="cohortCode"
                    required
                  />
                  <button type="button" class="btn btn-outline-secondary btn-sm" (click)="generateRandomCode()">
                    Generate
                  </button>
                </div>
              </div>

              <!-- Number of Trainees -->
              <div class="col-md-5">
                <label class="form-label fw-semibold small">Trainees Count <span class="text-danger">*</span></label>
                <input
                  type="number"
                  class="form-control"
                  placeholder="e.g. 45"
                  [(ngModel)]="formData.numberOfTrainees"
                  name="numberOfTrainees"
                  min="1"
                  required
                />
              </div>

              <!-- Required Skill -->
              <div class="col-12">
                <label class="form-label fw-semibold small">Required Skill(s) <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. Java, Spring Boot or Angular"
                  [(ngModel)]="formData.requiredSkill"
                  name="requiredSkill"
                  required
                />
                <small class="text-muted">Separate multiple skills with commas. The algorithm scores based on skill match.</small>
              </div>

              <!-- Service Line & Stream -->
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Service Line</label>
                <select class="form-select" [(ngModel)]="formData.serviceLine" name="serviceLine">
                  <option value="QEA">QEA (Quality Engineering & Assurance)</option>
                  <option value="ADM">ADM (Application Development & Mgmt)</option>
                  <option value="CDE">CDE (Cloud & Digital Engineering)</option>
                  <option value="CIS">CIS (Cloud & Infrastructure)</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold small">Stream</label>
                <select class="form-select" [(ngModel)]="formData.stream" name="stream">
                  <option value="Software Development">Software Development</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                  <option value="Data Engineering">Data Engineering</option>
                </select>
              </div>

              <!-- Dates -->
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Start Date <span class="text-danger">*</span></label>
                <input
                  type="date"
                  class="form-control"
                  [(ngModel)]="formData.startDate"
                  name="startDate"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold small">End Date <span class="text-danger">*</span></label>
                <input
                  type="date"
                  class="form-control"
                  [(ngModel)]="formData.endDate"
                  name="endDate"
                  required
                />
              </div>

              <!-- Vertical & Location -->
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Industry Vertical</label>
                <select class="form-select" [(ngModel)]="formData.vertical" name="vertical">
                  <option value="Healthcare">Healthcare</option>
                  <option value="Banking">Banking & Financial Services</option>
                  <option value="Retail">Retail & Consumer Goods</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Communications">Communications & Media</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold small">Training Location</label>
                <select class="form-select" [(ngModel)]="formData.location" name="location">
                  <option value="Chennai">Chennai</option>
                  <option value="Pune">Pune</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Virtual">Virtual / Online</option>
                </select>
              </div>
            </div>

            <!-- Algorithm Explanation Notice -->
            <div class="p-3 bg-light rounded-3 border mt-3 small text-secondary">
              <div class="d-flex gap-2">
                <i class="bi bi-info-circle-fill text-primary"></i>
                <div>
                  <strong>Deterministic Allocation:</strong> Once created, TrainMate will automatically match and score all active trainers using the 100-point algorithm and assign the best available candidate.
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary-custom" (click)="close.emit()" [disabled]="loading">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary-custom" [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Allocating Trainer...' : 'Create & Auto-Allocate' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CreateCohortModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() cohortCreated = new EventEmitter<Cohort>();

  formData: CreateCohortRequest = {
    cohortCode: 'QEA26SD' + Math.floor(100 + Math.random() * 900),
    serviceLine: 'QEA',
    stream: 'Software Development',
    requiredSkill: 'Java, Spring Boot',
    numberOfTrainees: 45,
    startDate: '2026-09-15',
    endDate: '2026-11-30',
    vertical: 'Healthcare',
    location: 'Chennai'
  };

  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private coachService: CoachService,
    private authService: AuthService
  ) {}

  generateRandomCode(): void {
    const num = Math.floor(100 + Math.random() * 900);
    this.formData.cohortCode = 'QEA26SD' + num;
  }

  onSubmit(): void {
    if (!this.formData.cohortCode || !this.formData.requiredSkill || !this.formData.startDate || !this.formData.endDate) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    if (new Date(this.formData.endDate) < new Date(this.formData.startDate)) {
      this.errorMessage = 'End date cannot be earlier than start date.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const coachId = this.authService.currentUserValue?.coachId || 1;

    this.coachService.createCohort(coachId, this.formData).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.cohortCreated.emit(res.data);
          this.close.emit();
        } else {
          this.errorMessage = res.message;
        }
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to create cohort.';
      }
    });
  }
}
