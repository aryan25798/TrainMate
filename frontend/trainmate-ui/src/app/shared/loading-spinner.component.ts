import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isLoading" class="blocking-action-overlay" role="status" aria-live="polite" aria-label="Processing">
      <div class="action-dialog">
        <div class="spinner-grow text-primary" style="width: 2.5rem; height: 2.5rem;" role="status"></div>
        <div>
          <div class="fw-bold text-dark" style="font-size: 0.95rem;">Processing Request</div>
          <small class="text-muted">Please wait while the server processes your submission...</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .blocking-action-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.35);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.15s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .action-dialog {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.75rem;
      background: white;
      border-radius: 14px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(226, 232, 240, 0.9);
      animation: popUp 0.15s ease;
    }

    @keyframes popUp {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class LoadingSpinnerComponent implements OnInit, OnDestroy {
  isLoading = false;
  private subscription?: Subscription;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.subscription = this.loadingService.loading$.subscribe((loading: boolean) => {
      this.isLoading = loading;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}