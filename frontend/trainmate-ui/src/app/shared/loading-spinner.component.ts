import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isLoading" class="global-loading-overlay" role="status" aria-live="polite" aria-label="Loading">
      <div class="loading-spinner-container">
        <div class="spinner"></div>
        <div class="text-center">
          <p class="loading-text">{{ isColdStarting ? 'Connecting to Cloud...' : 'Loading...' }}</p>
          <div *ngIf="isColdStarting" class="coldstart-hint">
            <span class="badge bg-primary-subtle text-primary mb-1">Render Cloud Warm-up</span>
            <p class="text-muted small mb-2" style="max-width: 260px; line-height: 1.35;">
              Waking up free-tier cloud container (~30-45s). Hang tight!
            </p>
            <div class="progress" style="height: 4px; width: 100%; border-radius: 4px;">
              <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary w-100"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .global-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(7, 12, 36, 0.45);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .loading-spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      padding: 2.25rem 2.5rem;
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 56, 0.25);
      min-width: 220px;
      border: 1px solid rgba(226, 232, 240, 0.8);
      animation: scaleUp 0.2s ease;
    }

    @keyframes scaleUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .spinner {
      width: 44px;
      height: 44px;
      border: 3.5px solid #e2e8f0;
      border-top-color: #0066f5;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      color: #0f172a;
      font-size: 0.95rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.01em;
    }

    .coldstart-hint {
      margin-top: 0.75rem;
      animation: fadeIn 0.3s ease;
    }
  `]
})
export class LoadingSpinnerComponent implements OnInit, OnDestroy {
  isLoading = false;
  isColdStarting = false;
  private timer: any;
  private subscription?: Subscription;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.subscription = this.loadingService.loading$.subscribe((loading: boolean) => {
      this.isLoading = loading;
      clearTimeout(this.timer);
      if (loading) {
        this.isColdStarting = false;
        this.timer = setTimeout(() => {
          if (this.isLoading) {
            this.isColdStarting = true;
          }
        }, 3200);
      } else {
        this.isColdStarting = false;
      }
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    this.subscription?.unsubscribe();
  }
}