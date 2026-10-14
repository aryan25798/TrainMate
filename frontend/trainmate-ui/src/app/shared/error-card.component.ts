import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content-card p-4 text-center my-3 border border-danger-subtle bg-danger-subtle bg-opacity-10">
      <div class="d-flex flex-column align-items-center justify-content-center">
        <div class="stat-icon red mb-3" style="width: 48px; height: 48px; font-size: 1.25rem;">
          <i class="bi bi-cloud-slash-fill"></i>
        </div>
        <h5 class="fw-bold text-dark mb-1">{{ title }}</h5>
        <p class="text-muted small mb-3" style="max-width: 480px;">
          {{ message }}
        </p>
        <button
          type="button"
          class="btn btn-sm btn-primary-custom px-3 py-1.5"
          (click)="retry.emit()"
          [disabled]="isRetrying">
          <span *ngIf="isRetrying" class="spinner-border spinner-border-sm me-1"></span>
          <i *ngIf="!isRetrying" class="bi bi-arrow-clockwise me-1"></i>
          {{ isRetrying ? 'Retrying...' : (buttonText || 'Retry Now') }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class ErrorCardComponent {
  @Input() title: string = 'Unable to load data';
  @Input() message: string = 'A network error occurred or the cloud server is temporarily waking up. Please retry.';
  @Input() buttonText: string = 'Retry Now';
  @Input() isRetrying: boolean = false;
  @Output() retry = new EventEmitter<void>();
}
