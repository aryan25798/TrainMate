import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CoachService } from '../../services/coach.service';
import { CohortService } from '../../services/cohort.service';
import { AuthService } from '../../services/auth.service';
import { Cohort, CohortUploadResponse, CreateCohortRequest } from '../../models/models';
import { CohortDetailsModalComponent } from '../../shared/cohort-details-modal.component';

@Component({
  selector: 'app-coach-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CohortDetailsModalComponent],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Add & Allocate Cohorts</h1>
          <p class="page-subtitle">Create a single cohort with instant auto-allocation or upload in bulk via Excel.</p>
        </div>
        <div>
          <button type="button" class="btn btn-secondary-custom" (click)="downloadSample()" *ngIf="activeTab === 'excel'">
            <i class="bi bi-download"></i>
            Download Sample Excel
          </button>
        </div>
      </div>

      <!-- Modern Tabs Switcher -->
      <div class="mb-4">
        <div class="nav-pills-modern">
          <button
            type="button"
            class="nav-link-modern"
            [class.active]="activeTab === 'manual'"
            (click)="activeTab = 'manual'">
            <i class="bi bi-plus-circle-fill"></i>
            Create Single Cohort (Manual Form)
          </button>
          <button
            type="button"
            class="nav-link-modern"
            [class.active]="activeTab === 'excel'"
            (click)="activeTab = 'excel'">
            <i class="bi bi-file-earmark-spreadsheet-fill"></i>
            Batch Upload (Excel File)
          </button>
        </div>
      </div>

      <!-- TAB 1: MANUAL COHORT CREATION FORM -->
      <div *ngIf="activeTab === 'manual'" class="row g-4">
        <div class="col-lg-8">
          <div class="content-card">
            <div class="content-card-header">
              <h3 class="content-card-title">
                <i class="bi bi-pencil-square text-primary me-2"></i>New Cohort Details
              </h3>
            </div>
            <div class="p-4">
              <!-- Alert Error -->
              <div class="alert alert-danger py-2 small" *ngIf="manualError">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ manualError }}
              </div>

              <!-- Form -->
              <form (ngSubmit)="onManualSubmit()">
                <div class="row g-3">
                  <!-- Cohort Code -->
                  <div class="col-md-7">
                    <label class="form-label fw-semibold small">Cohort Code <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        placeholder="e.g. QEA26SD105"
                        [(ngModel)]="manualForm.cohortCode"
                        name="cohortCode"
                        required
                      />
                      <button type="button" class="btn btn-outline-secondary btn-sm" (click)="generateRandomCode()">
                        Generate Code
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
                      [(ngModel)]="manualForm.numberOfTrainees"
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
                      [(ngModel)]="manualForm.requiredSkill"
                      name="requiredSkill"
                      required
                    />
                    <div class="d-flex align-items-center gap-1 mt-2">
                      <small class="text-muted me-1">Quick skill presets:</small>
                      <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-2" (click)="manualForm.requiredSkill = 'Java, Spring Boot'">Java, Spring Boot</button>
                      <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-2" (click)="manualForm.requiredSkill = 'Angular, JavaScript'">Angular, JavaScript</button>
                      <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-2" (click)="manualForm.requiredSkill = 'Spring Boot, Microservices'">Spring Boot, Microservices</button>
                      <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-2" (click)="manualForm.requiredSkill = 'Python, Django'">Python, Django</button>
                    </div>
                  </div>

                  <!-- Service Line & Stream -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Service Line</label>
                    <select class="form-select" [(ngModel)]="manualForm.serviceLine" name="serviceLine">
                      <option value="QEA">QEA (Quality Engineering & Assurance)</option>
                      <option value="ADM">ADM (Application Development & Mgmt)</option>
                      <option value="CDE">CDE (Cloud & Digital Engineering)</option>
                      <option value="CIS">CIS (Cloud & Infrastructure)</option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Stream</label>
                    <select class="form-select" [(ngModel)]="manualForm.stream" name="stream">
                      <option value="Software Development">Software Development</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                      <option value="Data Engineering">Data Engineering</option>
                    </select>
                  </div>

                  <!-- Start & End Date -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Start Date <span class="text-danger">*</span></label>
                    <input
                      type="date"
                      class="form-control"
                      [(ngModel)]="manualForm.startDate"
                      name="startDate"
                      required
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">End Date <span class="text-danger">*</span></label>
                    <input
                      type="date"
                      class="form-control"
                      [(ngModel)]="manualForm.endDate"
                      name="endDate"
                      required
                    />
                  </div>

                  <!-- Vertical & Location -->
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Industry Vertical</label>
                    <select class="form-select" [(ngModel)]="manualForm.vertical" name="vertical">
                      <option value="Healthcare">Healthcare</option>
                      <option value="Banking">Banking & Financial Services</option>
                      <option value="Retail">Retail & Consumer Goods</option>
                      <option value="Insurance">Insurance</option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Location</label>
                    <select class="form-select" [(ngModel)]="manualForm.location" name="location">
                      <option value="Chennai">Chennai</option>
                      <option value="Pune">Pune</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Virtual">Virtual / Remote</option>
                    </select>
                  </div>
                </div>

                <div class="mt-4 pt-2 d-flex gap-2">
                  <button type="submit" class="btn btn-primary-custom" [disabled]="isSubmittingManual">
                    <span *ngIf="isSubmittingManual" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!isSubmittingManual" class="bi bi-lightning-charge-fill me-1"></i>
                    {{ isSubmittingManual ? 'Allocating Trainer...' : 'Create & Auto-Allocate Trainer' }}
                  </button>
                  <button type="button" class="btn btn-outline-secondary" (click)="resetManualForm()">
                    Reset Form
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Recently Created Result Card with Allocation Details -->
          <div class="content-card mt-4 border-success shadow-sm" *ngIf="createdCohortResult">
            <div class="content-card-header bg-success-subtle">
              <h3 class="content-card-title text-success d-flex align-items-center gap-2">
                <i class="bi bi-check-circle-fill"></i>
                Cohort Created & Evaluated Successfully!
              </h3>
            </div>
            <div class="p-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 class="fw-bold text-dark mb-0">{{ createdCohortResult.cohortCode }}</h4>
                  <span class="badge-tag">{{ createdCohortResult.requiredSkill }}</span>
                </div>
                <span class="badge-status" [ngClass]="createdCohortResult.status === 'ASSIGNED' ? 'badge-assigned' : 'badge-unassigned'">
                  {{ createdCohortResult.status }}
                </span>
              </div>

              <!-- Winner Trainer Info -->
              <div *ngIf="createdCohortResult.assignedTrainerName" class="p-3 bg-light rounded-3 border mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <small class="text-muted d-block">Winning Allocated Trainer</small>
                    <h5 class="fw-bold text-primary mb-0">
                      <i class="bi bi-person-check-fill me-1"></i>
                      {{ createdCohortResult.assignedTrainerName }}
                    </h5>
                  </div>
                  <div class="text-end">
                    <small class="text-muted d-block">Suitability Score</small>
                    <span class="badge bg-success fs-6">{{ createdCohortResult.allocationScore }} / 100</span>
                  </div>
                </div>
              </div>

              <!-- Unassigned Info -->
              <div *ngIf="!createdCohortResult.assignedTrainerName" class="alert alert-warning mb-3">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                No eligible trainer currently available for these skills or dates. The cohort is saved as <strong>UNASSIGNED</strong> and alerts were sent to the Coach and Admin.
              </div>

              <div class="d-flex gap-2">
                <button type="button" class="btn btn-sm btn-outline-primary" (click)="viewResultDetails = createdCohortResult">
                  <i class="bi bi-calculator me-1"></i> View 100-Point Score Breakdown
                </button>
                <a routerLink="/coach/cohorts" class="btn btn-sm btn-secondary-custom">
                  Go to My Cohorts <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Explainer for Interview -->
        <div class="col-lg-4">
          <div class="content-card">
            <div class="content-card-header">
              <h3 class="content-card-title">How Allocation Works (Demo)</h3>
            </div>
            <div class="p-3 small text-secondary">
              <p class="mb-2">This 100-point algorithm calculates suitability deterministically:</p>
              <div class="p-2 bg-light rounded-2 border mb-2">
                <strong>1. Skill Match (40 pts):</strong> Proportional match to required skills. Must match $\ge$ 1.
              </div>
              <div class="p-2 bg-light rounded-2 border mb-2">
                <strong>2. Availability (20 pts):</strong> Trainer must cover the entire start-to-end window.
              </div>
              <div class="p-2 bg-light rounded-2 border mb-2">
                <strong>3. Current Workload (15 pts):</strong> Less workload gets more points. Excluded if at capacity.
              </div>
              <div class="p-2 bg-light rounded-2 border mb-2">
                <strong>4. Experience (15 pts):</strong> 0-2y: 5, 3-5y: 10, 6+y: 15.
              </div>
              <div class="p-2 bg-light rounded-2 border mb-3">
                <strong>5. Previous Cohorts (10 pts):</strong> 0-2: 3, 3-5: 6, 6+: 10.
              </div>
              <small class="text-muted">In case of a tie, the trainer with lower workload wins!</small>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: EXCEL BATCH UPLOAD -->
      <div *ngIf="activeTab === 'excel'" class="row g-4">
        <!-- Upload Card -->
        <div class="col-lg-7">
          <div class="content-card">
            <div class="content-card-header">
              <h3 class="content-card-title">Select Excel File (.xlsx)</h3>
            </div>
            <div class="p-4">
              <!-- Drop / File Area -->
              <div
                class="border border-2 border-dashed rounded-3 p-4 text-center bg-light mb-3"
                style="border-color: #cbd5e1 !important; cursor: pointer;"
                (click)="fileInput.click()">
                <i class="bi bi-file-earmark-spreadsheet text-primary fs-1 mb-2 d-block"></i>
                <h6 class="fw-bold mb-1">Click to select cohort Excel file</h6>
                <p class="text-muted small mb-0">Supported format: .xlsx</p>
                <input
                  #fileInput
                  type="file"
                  class="d-none"
                  accept=".xlsx, .xls"
                  (change)="onFileSelected($event)"
                />
              </div>

              <!-- Selected File details -->
              <div *ngIf="selectedFile" class="d-flex align-items-center justify-content-between p-3 bg-white border rounded-3 mb-3">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-file-earmark-check text-success fs-4"></i>
                  <div>
                    <div class="fw-semibold text-dark">{{ selectedFile.name }}</div>
                    <small class="text-muted">{{ (selectedFile.size / 1024).toFixed(1) }} KB</small>
                  </div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger border-0" (click)="selectedFile = null">
                  <i class="bi bi-trash"></i>
                </button>
              </div>

              <!-- Upload Button & Loading -->
              <div class="d-flex gap-2 align-items-center">
                <button
                  type="button"
                  class="btn btn-primary-custom"
                  [disabled]="!selectedFile || isUploading"
                  (click)="uploadFile()">
                  <span *ngIf="isUploading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isUploading ? uploadStatusText : 'Upload & Allocate All Rows' }}
                </button>

                <button *ngIf="uploadResponse" routerLink="/coach/cohorts" class="btn btn-secondary-custom">
                  View My Cohorts <i class="bi bi-arrow-right ms-1"></i>
                </button>
              </div>

              <div *ngIf="errorMessage" class="alert alert-danger mt-3 py-2 small">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
              </div>
            </div>
          </div>

          <!-- Upload Results Summary -->
          <div class="content-card" *ngIf="uploadResponse">
            <div class="content-card-header">
              <h3 class="content-card-title">Upload Completed</h3>
            </div>
            <div class="p-4">
              <div class="row text-center mb-3">
                <div class="col-4">
                  <div class="p-3 bg-light rounded-3 border">
                    <div class="text-muted small fw-semibold">Total Rows</div>
                    <div class="fs-4 fw-bold text-dark">{{ uploadResponse.totalRows }}</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="p-3 bg-light rounded-3 border">
                    <div class="text-muted small fw-semibold">Uploaded</div>
                    <div class="fs-4 fw-bold text-success">{{ uploadResponse.successfulRows }}</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="p-3 bg-light rounded-3 border">
                    <div class="text-muted small fw-semibold">Failed</div>
                    <div class="fs-4 fw-bold text-danger">{{ uploadResponse.failedRows }}</div>
                  </div>
                </div>
              </div>

              <!-- Errors List -->
              <div *ngIf="uploadResponse.errors && uploadResponse.errors.length > 0">
                <h6 class="fw-bold text-danger mb-2">
                  <i class="bi bi-exclamation-circle-fill me-1"></i> Validation Errors
                </h6>
                <div class="table-responsive border rounded-3">
                  <table class="table table-sm table-striped mb-0">
                    <thead class="table-light">
                      <tr>
                        <th style="width: 100px;">Excel Row</th>
                        <th>Error Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let err of uploadResponse.errors">
                        <td class="fw-bold text-danger">Row {{ err.row }}</td>
                        <td>{{ err.message }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div *ngIf="uploadResponse.successfulRows > 0" class="alert alert-success mt-3 py-2 small mb-3">
                <i class="bi bi-check-circle-fill me-2"></i>
                <strong>{{ uploadResponse.successfulRows }}</strong> cohort(s) saved and evaluated through the 100-point trainer allocation engine.
              </div>

              <!-- Batch Allocation Results Table -->
              <div *ngIf="uploadResponse.allocatedCohorts && uploadResponse.allocatedCohorts.length > 0" class="mt-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i class="bi bi-cpu-fill text-primary"></i> Batch Allocation Results
                  </h6>
                  <span class="badge bg-primary-subtle text-primary border border-primary px-2 py-1">
                    {{ uploadResponse.allocatedCohorts.length }} Evaluated
                  </span>
                </div>
                <div class="table-responsive border rounded-3">
                  <table class="table table-hover align-middle mb-0 small">
                    <thead class="table-light">
                      <tr>
                        <th>Cohort</th>
                        <th>Required Skill</th>
                        <th>Allocated Trainer</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>Breakdown</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let c of uploadResponse.allocatedCohorts">
                        <td class="fw-bold text-dark">{{ c.cohortCode }}</td>
                        <td><span class="badge-tag">{{ c.requiredSkill }}</span></td>
                        <td>
                          <div *ngIf="c.assignedTrainerName" class="d-flex align-items-center gap-2">
                            <span class="trainer-avatar" style="width:26px; height:26px; font-size:11px;">{{ getInitials(c.assignedTrainerName) }}</span>
                            <span class="fw-semibold text-dark">{{ c.assignedTrainerName }}</span>
                          </div>
                          <span *ngIf="!c.assignedTrainerName" class="text-warning small fst-italic">
                            <i class="bi bi-exclamation-triangle me-1"></i> None (Unassigned)
                          </span>
                        </td>
                        <td>
                          <span *ngIf="c.allocationScore != null && c.allocationScore > 0" class="badge bg-success text-white fw-bold px-2 py-1">
                            {{ c.allocationScore }} / 100
                          </span>
                          <span *ngIf="!c.allocationScore || c.allocationScore === 0" class="text-muted">-</span>
                        </td>
                        <td>
                          <span class="badge-status" [ngClass]="c.status === 'ASSIGNED' ? 'badge-assigned' : 'badge-unassigned'">
                            {{ c.status }}
                          </span>
                        </td>
                        <td>
                          <button type="button" class="btn btn-xs btn-outline-primary" (click)="viewResultDetails = c">
                            <i class="bi bi-calculator me-1"></i> Details
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions Card -->
        <div class="col-lg-5">
          <div class="content-card">
            <div class="content-card-header">
              <h3 class="content-card-title">Instructions & Validation Rules</h3>
            </div>
            <div class="p-4 small text-secondary">
              <p>Please ensure your Excel file conforms to the required template:</p>
              <ul class="ps-3 mb-3">
                <li><strong>Cohort Code:</strong> Must be unique and non-empty.</li>
                <li><strong>Required Skill:</strong> e.g. <em>Java, Spring Boot</em>.</li>
                <li><strong>Number of Trainees:</strong> Must be a positive number (> 0).</li>
                <li><strong>Dates:</strong> Valid dates (format: <code>01-Sep-2026</code> or <code>YYYY-MM-DD</code>).</li>
                <li><strong>End Date:</strong> Must not be earlier than Start Date.</li>
              </ul>
              <div class="p-3 bg-light rounded-3 border">
                <h6 class="fw-bold text-dark fs-7 mb-1"><i class="bi bi-lightning-charge-fill text-warning me-1"></i> Automatic Allocation</h6>
                <p class="mb-0">
                  Immediately upon upload, each valid cohort is evaluated against all active trainers using the 100-point rule-based scoring engine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cohort Details Modal for Created Cohort -->
    <app-cohort-details-modal
      *ngIf="viewResultDetails"
      [cohort]="viewResultDetails"
      (close)="viewResultDetails = null">
    </app-cohort-details-modal>
  `
})
export class CoachUploadComponent {
  activeTab: 'manual' | 'excel' = 'manual';

  // Manual Form State
  manualForm: CreateCohortRequest = {
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
  isSubmittingManual: boolean = false;
  manualError: string = '';
  createdCohortResult: Cohort | null = null;
  viewResultDetails: Cohort | null = null;

  // Excel Upload State
  selectedFile: File | null = null;
  isUploading: boolean = false;
  uploadStatusText: string = 'Uploading Excel...';
  uploadResponse: CohortUploadResponse | null = null;
  errorMessage: string = '';

  constructor(
    private coachService: CoachService,
    private cohortService: CohortService,
    private authService: AuthService
  ) {}

  generateRandomCode(): void {
    this.manualForm.cohortCode = 'QEA26SD' + Math.floor(100 + Math.random() * 900);
  }

  resetManualForm(): void {
    this.generateRandomCode();
    this.manualForm.requiredSkill = 'Java, Spring Boot';
    this.manualForm.numberOfTrainees = 45;
    this.manualError = '';
    this.createdCohortResult = null;
  }

  onManualSubmit(): void {
    if (!this.manualForm.cohortCode || !this.manualForm.requiredSkill || !this.manualForm.startDate || !this.manualForm.endDate) {
      this.manualError = 'Please complete all required fields.';
      return;
    }

    if (new Date(this.manualForm.endDate) < new Date(this.manualForm.startDate)) {
      this.manualError = 'End date cannot be earlier than start date.';
      return;
    }

    this.isSubmittingManual = true;
    this.manualError = '';
    this.createdCohortResult = null;

    const coachId = this.authService.currentUserValue?.coachId || 1;

    this.coachService.createCohort(coachId, this.manualForm).subscribe({
      next: res => {
        this.isSubmittingManual = false;
        if (res.success) {
          this.createdCohortResult = res.data;
          this.generateRandomCode(); // prepare next code
        } else {
          this.manualError = res.message;
        }
      },
      error: err => {
        this.isSubmittingManual = false;
        this.manualError = err.error?.message || 'Failed to create cohort.';
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.uploadResponse = null;
      this.errorMessage = '';
    }
  }

  downloadSample(): void {
    this.cohortService.downloadSampleTemplate().subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cohort_template.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.errorMessage = 'Could not download template.';
      }
    });
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadStatusText = 'Uploading Excel & Running Allocation Engine...';
    this.errorMessage = '';

    const coachId = this.authService.currentUserValue?.coachId || 1;

    this.coachService.uploadCohorts(coachId, this.selectedFile).subscribe({
      next: res => {
        this.isUploading = false;
        if (res.success) {
          this.uploadResponse = res.data;
          this.selectedFile = null;
        } else {
          this.errorMessage = res.message;
        }
      },
      error: err => {
        this.isUploading = false;
        this.errorMessage = err.error?.message || 'Error processing Excel file.';
        if (err.error?.data) {
          this.uploadResponse = err.error.data;
        }
      }
    });
  }

  getInitials(name?: string): string {
    if (!name) return 'TR';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
