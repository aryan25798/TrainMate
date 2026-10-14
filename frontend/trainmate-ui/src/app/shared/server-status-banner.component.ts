import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackendStatusService, BackendStatusInfo } from '../services/backend-status.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-server-status-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="status.state !== 'CONNECTED'" class="server-status-container" role="status" aria-live="polite">
      <!-- Waking Up State -->
      <div *ngIf="status.state === 'WAKING_UP'" class="server-banner banner-waking">
        <div class="d-flex align-items-center justify-content-between w-100 flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <span class="status-pulse-dot"></span>
            <span class="banner-title fw-semibold">Connecting to cloud server...</span>
            <span class="badge bg-white text-primary fw-bold px-2 py-0.5" style="font-size: 0.725rem;">
              Wake-up {{ status.attempt }}/{{ status.maxAttempts }}
            </span>
          </div>
          <span class="text-muted small d-none d-md-inline">
            Free-tier container is booting from standby (~30-45s). Your request will automatically resolve.
          </span>
        </div>
        <div class="progress banner-progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary w-100"></div>
        </div>
      </div>

      <!-- Degraded State -->
      <div *ngIf="status.state === 'DEGRADED'" class="server-banner banner-degraded">
        <div class="d-flex align-items-center justify-content-between w-100 flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-exclamation-triangle-fill text-warning"></i>
            <span class="banner-title fw-semibold text-dark">Server wake-up delayed</span>
            <span class="text-muted small">The cloud container is taking longer than usual to respond.</span>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-primary-custom py-1 px-3"
            (click)="onRetry()"
            [disabled]="isRetrying">
            <span *ngIf="isRetrying" class="spinner-border spinner-border-sm me-1"></span>
            <i *ngIf="!isRetrying" class="bi bi-arrow-clockwise me-1"></i>
            {{ isRetrying ? 'Checking...' : 'Retry Connection' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .server-status-container {
      position: sticky;
      top: 0;
      z-index: 1040;
      animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideDown {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .server-banner {
      padding: 0.65rem 1.25rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      font-size: 0.85rem;
      position: relative;
      overflow: hidden;
    }

    .banner-waking {
      background: #eff6ff;
      border-bottom-color: #bfdbfe;
      color: #1e40af;
    }

    .banner-degraded {
      background: #fffbeb;
      border-bottom-color: #fde68a;
      color: #92400e;
    }

    .banner-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      border-radius: 0;
      background: rgba(226, 232, 240, 0.5);
    }

    .status-pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #2563eb;
      display: inline-block;
      animation: pulseGlow 1.5s infinite;
    }

    @keyframes pulseGlow {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(37, 99, 235, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
    }

    @media (prefers-reduced-motion: reduce) {
      .server-status-container { animation: none; }
      .status-pulse-dot { animation: none; }
      .progress-bar-animated { animation: none; }
    }
  `]
})
export class ServerStatusBannerComponent implements OnInit, OnDestroy {
  status: BackendStatusInfo = { state: 'CONNECTED', attempt: 0, maxAttempts: 4 };
  isRetrying = false;
  private sub?: Subscription;

  constructor(private backendStatusService: BackendStatusService) {}

  ngOnInit(): void {
    this.sub = this.backendStatusService.status$.subscribe(info => {
      this.status = info;
    });
  }

  onRetry(): void {
    this.isRetrying = true;
    this.backendStatusService.retryConnection().subscribe({
      next: () => {
        this.isRetrying = false;
        this.backendStatusService.notifyConnected();
      },
      error: () => {
        this.isRetrying = false;
        this.backendStatusService.notifyDegraded('Server is still initializing. Please wait a moment and try again.');
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
