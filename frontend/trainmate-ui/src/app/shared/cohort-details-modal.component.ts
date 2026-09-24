import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cohort } from '../models/models';

@Component({
  selector: 'app-cohort-details-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="cohort" (click)="onBackdropClick($event)">
      <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-2">
            <h5 class="modal-title fw-bold mb-0 text-dark">{{ cohort.cohortCode }}</h5>
            <span class="badge-status" [ngClass]="getStatusBadgeClass(cohort.status)">{{ cohort.status }}</span>
          </div>
          <button type="button" class="btn-close" (click)="close.emit()"></button>
        </div>

        <div class="modal-body">
          <!-- Hero Score Display if allocated -->
          <div *ngIf="cohort.scoreBreakdown" class="text-center mb-4">
            <div class="score-hero-circle">
              <span class="score-hero-value">{{ cohort.scoreBreakdown.totalScore }}</span>
              <span class="score-hero-total">/ 100 PTS</span>
            </div>
            <h6 class="fw-bold mb-1">Algorithmic Suitability Score</h6>
            <span class="text-muted small">Evaluated across Skills, Availability, Workload & Experience</span>
          </div>

          <!-- Cohort Specs Grid -->
          <div class="card p-3 border rounded-3 bg-light mb-4">
            <div class="row g-3">
              <div class="col-6 col-md-4">
                <small class="text-muted d-block text-uppercase fw-semibold" style="font-size: 0.7rem;">Domain / Stream</small>
                <span class="fw-semibold text-dark">{{ cohort.serviceLine }} &bull; {{ cohort.stream }}</span>
              </div>
              <div class="col-6 col-md-4">
                <small class="text-muted d-block text-uppercase fw-semibold" style="font-size: 0.7rem;">Trainees</small>
                <span class="fw-semibold text-dark">{{ cohort.numberOfTrainees }} Associates</span>
              </div>
              <div class="col-12 col-md-4">
                <small class="text-muted d-block text-uppercase fw-semibold" style="font-size: 0.7rem;">Location</small>
                <span class="fw-semibold text-dark"><i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ cohort.location }}</span>
              </div>
              <div class="col-6">
                <small class="text-muted d-block text-uppercase fw-semibold" style="font-size: 0.7rem;">Duration</small>
                <span class="fw-semibold text-dark">{{ cohort.startDate }} &rarr; {{ cohort.endDate }}</span>
              </div>
              <div class="col-6">
                <small class="text-muted d-block text-uppercase fw-semibold" style="font-size: 0.7rem;">Primary Skill</small>
                <span class="badge-tag">{{ cohort.requiredSkill }}</span>
              </div>
            </div>
          </div>

          <!-- Assignment & Trainer Info -->
          <div class="p-3 border rounded-3 mb-4" [ngClass]="cohort.assignedTrainerName ? 'bg-primary-subtle border-primary-subtle' : 'bg-danger-subtle border-danger-subtle'">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <small class="d-block text-uppercase fw-bold" style="font-size: 0.7rem;" [ngClass]="cohort.assignedTrainerName ? 'text-primary' : 'text-danger'">
                  Assigned Trainer
                </small>
                <h6 class="fw-bold mb-0 text-dark" *ngIf="cohort.assignedTrainerName">
                  <i class="bi bi-person-check-fill text-primary me-1"></i>
                  {{ cohort.assignedTrainerName }}
                  <span class="text-muted fw-normal small">({{ cohort.assignedTrainerEmployeeId }})</span>
                </h6>
                <h6 class="fw-bold mb-0 text-danger" *ngIf="!cohort.assignedTrainerName">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i>
                  No trainer assigned (Manual Admin action required)
                </h6>
              </div>
              <span class="badge bg-white text-dark border px-2 py-1 small fw-semibold" *ngIf="cohort.allocationType">
                {{ cohort.allocationType }}
              </span>
            </div>
          </div>

          <!-- 100-Point Rule-Based Score Breakdown Bars -->
          <div *ngIf="cohort.scoreBreakdown" class="card border rounded-3 p-3">
            <h6 class="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
              <i class="bi bi-cpu-fill text-primary"></i>
              100-Point Allocation Breakdown
            </h6>

            <!-- 1. Skill Match -->
            <div class="mb-2.5">
              <div class="d-flex justify-content-between align-items-center small">
                <span class="fw-semibold text-secondary">Skill Match Weight</span>
                <span class="fw-bold text-dark">{{ cohort.scoreBreakdown.skillScore }} / 40 pts</span>
              </div>
              <div class="score-progress-bar-container">
                <div class="score-progress-bar" [style.width.%]="(cohort.scoreBreakdown.skillScore / 40) * 100" style="background: linear-gradient(90deg, #0066f5, #00d2ff);"></div>
              </div>
            </div>

            <!-- 2. Availability -->
            <div class="mb-2.5">
              <div class="d-flex justify-content-between align-items-center small">
                <span class="fw-semibold text-secondary">Availability Match</span>
                <span class="fw-bold text-dark">{{ cohort.scoreBreakdown.availabilityScore }} / 20 pts</span>
              </div>
              <div class="score-progress-bar-container">
                <div class="score-progress-bar" [style.width.%]="(cohort.scoreBreakdown.availabilityScore / 20) * 100" style="background: #10b981;"></div>
              </div>
            </div>

            <!-- 3. Workload Capacity -->
            <div class="mb-2.5">
              <div class="d-flex justify-content-between align-items-center small">
                <span class="fw-semibold text-secondary">Workload Headroom</span>
                <span class="fw-bold text-dark">{{ cohort.scoreBreakdown.workloadScore }} / 15 pts</span>
              </div>
              <div class="score-progress-bar-container">
                <div class="score-progress-bar" [style.width.%]="(cohort.scoreBreakdown.workloadScore / 15) * 100" style="background: #8b5cf6;"></div>
              </div>
            </div>

            <!-- 4. Experience -->
            <div class="mb-2.5">
              <div class="d-flex justify-content-between align-items-center small">
                <span class="fw-semibold text-secondary">Experience Seniority</span>
                <span class="fw-bold text-dark">{{ cohort.scoreBreakdown.experienceScore }} / 15 pts</span>
              </div>
              <div class="score-progress-bar-container">
                <div class="score-progress-bar" [style.width.%]="(cohort.scoreBreakdown.experienceScore / 15) * 100" style="background: #6366f1;"></div>
              </div>
            </div>

            <!-- 5. Cohort Track Record -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center small">
                <span class="fw-semibold text-secondary">Past Cohort Delivery</span>
                <span class="fw-bold text-dark">{{ cohort.scoreBreakdown.previousCohortsScore }} / 10 pts</span>
              </div>
              <div class="score-progress-bar-container">
                <div class="score-progress-bar" [style.width.%]="(cohort.scoreBreakdown.previousCohortsScore / 10) * 100" style="background: #14b8a6;"></div>
              </div>
            </div>

            <!-- Explanation text -->
            <div class="p-3 bg-light rounded-3 text-muted small fst-italic border">
              <i class="bi bi-info-circle-fill text-primary me-1 not-italic"></i>
              {{ cohort.scoreBreakdown.explanation }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary-custom" (click)="close.emit()">Close</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .score-hero-circle {
      width: 104px;
      height: 104px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(0, 102, 245, 0.08) 0%, rgba(0, 210, 255, 0.12) 100%);
      border: 3px solid rgba(0, 102, 245, 0.25);
      box-shadow: 0 4px 16px rgba(0, 102, 245, 0.12);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0 auto 0.85rem auto;
    }
    .score-hero-value {
      font-size: 2.1rem;
      font-weight: 800;
      color: #000038;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .score-hero-total {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #0066f5;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .score-progress-bar-container {
      width: 100%;
      height: 8px;
      background-color: #f1f5f9;
      border-radius: 999px;
      overflow: hidden;
      margin-top: 4px;
    }
    .score-progress-bar {
      height: 100%;
      border-radius: 999px;
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `]
})
export class CohortDetailsModalComponent {
  @Input() cohort: Cohort | null = null;
  @Output() close = new EventEmitter<void>();

  onBackdropClick(e: MouseEvent): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ASSIGNED': return 'badge-assigned';
      case 'UNASSIGNED': return 'badge-unassigned';
      case 'ACTIVE': return 'badge-active';
      case 'COMPLETED': return 'badge-completed';
      default: return 'badge-pending';
    }
  }
}
