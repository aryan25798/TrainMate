import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrapper">
      <div
        *ngFor="let toast of toastService.toasts$ | async"
        class="custom-toast"
        [ngClass]="'toast-' + toast.type"
      >
        <div class="toast-icon">
          <i *ngIf="toast.type === 'success'" class="bi bi-check-circle-fill"></i>
          <i *ngIf="toast.type === 'danger'" class="bi bi-exclamation-octagon-fill"></i>
          <i *ngIf="toast.type === 'warning'" class="bi bi-exclamation-triangle-fill"></i>
          <i *ngIf="toast.type === 'info'" class="bi bi-info-circle-fill"></i>
        </div>
        <div class="toast-content">{{ toast.message }}</div>
        <button type="button" class="toast-close" (click)="toastService.remove(toast.id)">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-wrapper {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 10550;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      max-width: 400px;
      width: calc(100% - 48px);
    }
    .custom-toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      font-size: 13.5px;
      font-weight: 500;
      animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(8px);
    }
    .toast-success {
      background: #0f382c;
      color: #75f4c5;
      border: 1px solid #1f7058;
    }
    .toast-danger {
      background: #3b1219;
      color: #ff949f;
      border: 1px solid #752533;
    }
    .toast-info {
      background: #0d2847;
      color: #8ac0ff;
      border: 1px solid #1c4e85;
    }
    .toast-warning {
      background: #3b2807;
      color: #ffd27d;
      border: 1px solid #7a5412;
    }
    .toast-icon {
      font-size: 18px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    .toast-content {
      flex: 1;
      line-height: 1.4;
    }
    .toast-close {
      background: transparent;
      border: none;
      color: currentColor;
      opacity: 0.7;
      cursor: pointer;
      font-size: 18px;
      padding: 0;
      line-height: 1;
      transition: opacity 0.2s;
    }
    .toast-close:hover {
      opacity: 1;
    }
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}
}
