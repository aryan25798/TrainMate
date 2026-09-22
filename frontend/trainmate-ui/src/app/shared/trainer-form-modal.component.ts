import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateTrainerRequest, Trainer } from '../models/models';
import { AdminService } from '../services/admin.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-trainer-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px; overflow: hidden;">
          <div class="modal-header border-0 bg-light p-4">
            <div>
              <h5 class="modal-title fw-bold text-dark mb-0">
                <i class="bi" [ngClass]="isEdit ? 'bi-pencil-square text-warning' : 'bi-person-plus-fill text-primary'"></i>
                {{ isEdit ? 'Edit Trainer: ' + trainer?.name : 'Register New Trainer' }}
              </h5>
              <small class="text-muted">{{ isEdit ? 'Update skill proficiencies and workload ceiling' : 'Add a technical trainer to the Cognizant Academy resource pool' }}</small>
            </div>
            <button type="button" class="btn-close" (click)="closed.emit()"></button>
          </div>

          <form (ngSubmit)="onSave()" class="modal-body p-4">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold small text-muted">Full Name *</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="formData.name"
                  name="name"
                  placeholder="e.g. Ramesh Chandra"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold small text-muted">Corporate Email *</label>
                <input
                  type="email"
                  class="form-control"
                  [(ngModel)]="formData.email"
                  name="email"
                  placeholder="e.g. ramesh.c@cognizant.com"
                  [disabled]="isEdit"
                  required
                />
              </div>

              <div class="col-12">
                <label class="form-label fw-semibold small text-muted">Technical Skill Set (Comma-separated) *</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="formData.skillSet"
                  name="skillSet"
                  placeholder="e.g. Java, Spring Boot, Microservices, SQL, AWS"
                  required
                />
                <div class="form-text small text-muted">
                  Used by the 100-point Allocation Engine to match against cohort requirements (40 pts max).
                </div>
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold small text-muted">Experience (Years) *</label>
                <input
                  type="number"
                  class="form-control"
                  [(ngModel)]="formData.experienceYears"
                  name="experienceYears"
                  step="0.5"
                  min="0"
                  required
                />
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold small text-muted">Available From *</label>
                <input
                  type="date"
                  class="form-control"
                  [(ngModel)]="formData.availableFrom"
                  name="availableFrom"
                  required
                />
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold small text-muted">Available Till *</label>
                <input
                  type="date"
                  class="form-control"
                  [(ngModel)]="formData.availableTill"
                  name="availableTill"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold small text-muted">Maximum Concurrent Workload *</label>
                <input
                  type="number"
                  class="form-control"
                  [(ngModel)]="formData.maxWorkload"
                  name="maxWorkload"
                  min="1"
                  max="10"
                  required
                />
                <div class="form-text small text-muted">Maximum active batches this trainer can handle simultaneously (default: 5).</div>
              </div>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger mt-3 py-2 small">
              <i class="bi bi-exclamation-circle-fill me-1"></i> {{ errorMessage }}
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <button type="button" class="btn btn-light px-3" (click)="closed.emit()" [disabled]="isSubmitting">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary px-4" [disabled]="isSubmitting">
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEdit ? 'Save Changes' : 'Add Trainer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class TrainerFormModalComponent implements OnInit {
  @Input() trainer?: Trainer;
  @Input() isEdit: boolean = false;
  @Output() saved = new EventEmitter<Trainer>();
  @Output() closed = new EventEmitter<void>();

  formData: CreateTrainerRequest = {
    name: '',
    email: '',
    skillSet: '',
    experienceYears: 3,
    availableFrom: new Date().toISOString().split('T')[0],
    availableTill: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxWorkload: 5
  };

  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.isEdit && this.trainer) {
      this.formData = {
        name: this.trainer.name,
        email: 'trainer' + this.trainer.id + '@cognizant.com',
        skillSet: this.trainer.skills ? this.trainer.skills.join(', ') : '',
        experienceYears: this.trainer.experienceYears || 0,
        availableFrom: this.trainer.availableFrom,
        availableTill: this.trainer.availableTill,
        maxWorkload: this.trainer.maximumWorkload || 5
      };
    }
  }

  onSave(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    if (this.isEdit && this.trainer) {
      this.adminService.updateTrainer(this.trainer.id, this.formData).subscribe({
        next: res => {
          this.isSubmitting = false;
          if (res.success) {
            this.toastService.success(`Trainer ${res.data.name} updated successfully.`);
            this.saved.emit(res.data);
          } else {
            this.errorMessage = res.message;
          }
        },
        error: err => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Failed to update trainer.';
        }
      });
    } else {
      this.adminService.createTrainer(this.formData).subscribe({
        next: res => {
          this.isSubmitting = false;
          if (res.success) {
            this.toastService.success(`Trainer ${res.data.name} registered successfully.`);
            this.saved.emit(res.data);
          } else {
            this.errorMessage = res.message;
          }
        },
        error: err => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Failed to register trainer.';
        }
      });
    }
  }
}
