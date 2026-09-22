import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px; overflow: hidden;">
          <div class="modal-body p-4 text-center">
            <div
              class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              [ngClass]="isDanger ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'"
              style="width: 56px; height: 56px; font-size: 24px;"
            >
              <i *ngIf="isDanger" class="bi bi-exclamation-triangle-fill"></i>
              <i *ngIf="!isDanger" class="bi bi-question-circle-fill"></i>
            </div>
            <h5 class="modal-title fw-bold text-dark mb-2">{{ title }}</h5>
            <p class="text-muted small mb-4">{{ message }}</p>

            <div class="d-flex justify-content-center gap-2">
              <button type="button" class="btn btn-light px-4 py-2" (click)="cancel.emit()">
                {{ cancelText }}
              </button>
              <button
                type="button"
                class="btn px-4 py-2 fw-semibold"
                [ngClass]="isDanger ? 'btn-danger' : 'btn-primary'"
                (click)="confirm.emit()"
              >
                {{ confirmText }}
              </button>
            </div>
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
