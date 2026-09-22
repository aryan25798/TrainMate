import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="cancel.emit()">
      <div class="modal-card modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-body p-4 text-center">
          <div
            class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            [ngClass]="isDanger ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'"
            style="width: 54px; height: 54px; font-size: 22px;"
          >
            <i *ngIf="isDanger" class="bi bi-exclamation-triangle-fill"></i>
            <i *ngIf="!isDanger" class="bi bi-question-circle-fill"></i>
          </div>
          <h5 class="modal-title fw-bold text-dark mb-2">{{ title }}</h5>
          <p class="text-muted small mb-4">{{ message }}</p>

          <div class="d-flex justify-content-center gap-2">
            <button type="button" class="btn btn-secondary-custom px-4" (click)="cancel.emit()">
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="btn px-4 fw-semibold"
              [ngClass]="isDanger ? 'btn-danger' : 'btn-primary-custom'"
              (click)="confirm.emit()"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfirmModalComponent {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() isDanger: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
