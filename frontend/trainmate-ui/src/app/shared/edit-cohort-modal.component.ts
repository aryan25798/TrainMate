import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cohort, CreateCohortRequest } from '../models/models';
import { CohortService } from '../services/cohort.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-edit-cohort-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="closed.emit()">
      <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h5 class="modal-title fw-bold text-dark mb-0">
              <i class="bi bi-pencil-square text-primary me-2"></i>
              Edit Cohort: {{ cohort.cohortCode }}
            </h5>
            <small class="text-muted">Modify batch specifications, skills, or timeline</small>
          </div>
          <button type="button" class="btn-close" (click)="closed.emit()"></button>
        </div>

        <form (ngSubmit)="onSave()">
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold small text-muted">Required Skills *</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="formData.requiredSkill"
                  name="requiredSkill"
                  placeholder="e.g. Java, Spring Boot, SQL"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold small text-muted">Number of Trainees *</label>
                <input
                  type="number"
                  class="form-control"
                  [(ngModel)]="formData.numberOfTrainees"
                  name="numberOfTrainees"
                  min="1"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold small text-muted">Start Date *</label>
                <input
                  type="date"
                  class="form-control"
                  [(ngModel)]="formData.startDate"
                  name="startDate"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold small text-muted">End Date *</label>
                <input
                  type="date"
                  class="form-control"
                  [(ngModel)]="formData.endDate"
                  name="endDate"
                  required
                />
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold small text-muted">Location *</label>
                <select class="form-select" [(ngModel)]="formData.location" name="location" required>
                  <option value="Chennai">Chennai</option>
                  <option value="Pune">Pune</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Virtual">Virtual / Remote</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold small text-muted">Service Line</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="formData.serviceLine"
                  name="serviceLine"
                />
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold small text-muted">Stream</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="formData.stream"
                  name="stream"
                />
              </div>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger mt-3 py-2 small">
              <i class="bi bi-exclamation-circle-fill me-1"></i> {{ errorMessage }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary-custom" (click)="closed.emit()" [disabled]="isSubmitting">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary-custom" [disabled]="isSubmitting">
              <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EditCohortModalComponent implements OnInit {
  @Input() cohort!: Cohort;
  @Output() updated = new EventEmitter<Cohort>();
  @Output() closed = new EventEmitter<void>();

  formData: CreateCohortRequest = {
    cohortCode: '',
    serviceLine: 'QEA',
    stream: 'Software Development',
    requiredSkill: '',
    numberOfTrainees: 30,
    startDate: '',
    endDate: '',
    location: 'Chennai',
    vertical: 'General'
  };

  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(
    private cohortService: CohortService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.cohort) {
      this.formData = {
        cohortCode: this.cohort.cohortCode,
        serviceLine: this.cohort.serviceLine || 'QEA',
        stream: this.cohort.stream || 'Software Development',
        requiredSkill: this.cohort.requiredSkill,
        numberOfTrainees: this.cohort.numberOfTrainees,
        startDate: this.cohort.startDate,
        endDate: this.cohort.endDate,
        location: this.cohort.location,
        vertical: this.cohort.vertical || 'General'
      };
    }
  }

  onSave(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.cohortService.updateCohort(this.cohort.id, this.formData).subscribe({
      next: res => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastService.success(`Cohort ${this.cohort.cohortCode} updated successfully.`);
          this.updated.emit(res.data);
        } else {
          this.errorMessage = res.message;
        }
      },
      error: err => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to update cohort.';
      }
    });
  }
}
