import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="cancel.emit()">
      <div class="modal-card modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-body p-3 p-sm-4 text-center">
          <div
            class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            [ngClass]="isDanger ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'"
            style="width: 48px; height: 48px; font-size: 20px;"
          >
            <i *ngIf="isDanger" class="bi bi-exclamation-triangle-fill"></i>
            <i *ngIf="!isDanger" class="bi bi-question-circle-fill"></i>
          </div>
          <h5 class="modal-title fw-bold text-dark mb-1.5" style="font-size: 1.15rem;">{{ title }}</h5>
          <p class="text-muted small mb-3.5 lh-sm" style="font-size: 0.85rem;">{{ message }}</p>

          <div class="d-flex gap-2 w-100 mt-2">
            <button type="button" class="btn btn-light border px-3 py-2.5 flex-grow-1 fw-semibold text-secondary" (click)="cancel.emit()">
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="btn px-3 py-2.5 fw-semibold flex-grow-1"
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
