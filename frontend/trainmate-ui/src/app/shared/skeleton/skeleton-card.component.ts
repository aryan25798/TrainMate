import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card skeleton-stat-card" [ngClass]="customClass">
      <div class="w-100">
        <div class="skeleton-shimmer skeleton-title mb-2"></div>
        <div class="skeleton-shimmer skeleton-value"></div>
      </div>
      <div class="skeleton-shimmer skeleton-icon"></div>
    </div>
  `,
  styles: [`
    .skeleton-stat-card {
      pointer-events: none;
      user-select: none;
      min-height: 98px;
    }

    .skeleton-shimmer {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite ease-in-out;
      border-radius: 6px;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .skeleton-title {
      width: 45%;
      height: 12px;
    }

    .skeleton-value {
      width: 35%;
      height: 28px;
      border-radius: 8px;
    }

    .skeleton-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      flex-shrink: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton-shimmer {
        animation: none;
        background: #f1f5f9;
        opacity: 0.8;
      }
    }
  `]
})
export class SkeletonCardComponent {
  @Input() customClass = '';
}
