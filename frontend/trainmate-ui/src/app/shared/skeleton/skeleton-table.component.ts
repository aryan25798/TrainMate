import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-responsive">
      <table class="table align-middle skeleton-table mb-0">
        <thead *ngIf="showHeaders">
          <tr>
            <th *ngFor="let col of columnList" [style.width]="col.width || 'auto'">
              <div class="skeleton-shimmer skeleton-header"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of rowList">
            <td *ngFor="let col of columnList" [style.width]="col.width || 'auto'">
              <div
                class="skeleton-shimmer"
                [style.width]="col.width ? '75%' : getRandomWidth(col.index)"
                [style.height]="col.isAvatar ? '32px' : '16px'"
                [style.border-radius]="col.isAvatar ? '50%' : (col.isPill ? '999px' : '6px')"
                [style.max-width]="col.isAvatar ? '32px' : '100%'"
              ></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .skeleton-table {
      pointer-events: none;
      user-select: none;
    }

    .skeleton-shimmer {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite ease-in-out;
      display: inline-block;
      vertical-align: middle;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .skeleton-header {
      width: 60%;
      height: 14px;
      border-radius: 4px;
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
export class SkeletonTableComponent {
  @Input() rows: number = 5;
  @Input() columns: number = 6;
  @Input() showHeaders: boolean = false;
  @Input() customColumns?: { width?: string; isAvatar?: boolean; isPill?: boolean; index: number }[];

  get rowList(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }

  get columnList(): { width?: string; isAvatar?: boolean; isPill?: boolean; index: number }[] {
    if (this.customColumns && this.customColumns.length > 0) {
      return this.customColumns;
    }
    return Array.from({ length: this.columns }, (_, i) => ({
      index: i,
      isAvatar: i === 2,
      isPill: i === 4
    }));
  }

  getRandomWidth(colIndex: number): string {
    const widths = ['55%', '70%', '40%', '85%', '60%', '50%', '75%'];
    return widths[colIndex % widths.length];
  }
}
