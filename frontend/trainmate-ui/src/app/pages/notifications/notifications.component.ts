import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { NotificationItem } from '../../models/models';
import { ErrorCardComponent } from '../../shared/error-card.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, ErrorCardComponent],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Mailbox</h1>
          <p class="page-subtitle">Internal messages, cohort assignment alerts, and system notifications.</p>
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="text-muted small" *ngIf="!isLoading">
            {{ mails.length }} message(s) &bull; {{ unreadCount }} unread
          </span>
          <button
            *ngIf="!isLoading && unreadCount > 0"
            type="button"
            class="btn btn-sm btn-outline-primary"
            (click)="markAllRead()"
            [disabled]="markingRead">
            <span *ngIf="markingRead" class="spinner-border spinner-border-sm me-1"></span>
            <i *ngIf="!markingRead" class="bi bi-check2-all me-1"></i>
            Mark All as Read
          </button>
        </div>
      </div>

      <!-- Error State with Retry -->
      <app-error-card
        *ngIf="hasError"
        title="Unable to load notifications"
        message="A network error occurred or the cloud server is waking up. Click below to retry."
        [isRetrying]="isLoading"
        (retry)="loadNotifications()">
      </app-error-card>

      <!-- Mail List -->
      <div class="content-card" *ngIf="!hasError">
        <div class="p-0">
          <!-- Skeleton Loading State -->
          <div *ngIf="isLoading">
            <div *ngFor="let i of [1,2,3,4]" class="p-3 border-bottom d-flex align-items-start gap-3">
              <div class="skeleton-shimmer" style="width: 38px; height: 38px; border-radius: 8px;"></div>
              <div class="flex-grow-1">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <div class="skeleton-shimmer" style="width: 65px; height: 18px; border-radius: 4px;"></div>
                  <div class="skeleton-shimmer" style="width: 90px; height: 18px; border-radius: 4px;"></div>
                  <div class="skeleton-shimmer ms-auto" style="width: 100px; height: 14px; border-radius: 4px;"></div>
                </div>
                <div class="skeleton-shimmer" style="width: 85%; height: 14px; border-radius: 4px; margin-bottom: 6px;"></div>
                <div class="skeleton-shimmer" style="width: 55%; height: 14px; border-radius: 4px;"></div>
              </div>
            </div>
          </div>

          <!-- Real Notifications -->
          <ng-container *ngIf="!isLoading">
            <div
              *ngFor="let m of mails"
              class="p-3 border-bottom d-flex align-items-start justify-content-between"
              [ngClass]="m.isRead === false ? 'bg-primary-subtle bg-opacity-25' : 'bg-white'">
              
              <div class="d-flex align-items-start gap-3">
                <div class="mt-1">
                  <div class="stat-icon" [ngClass]="m.isRead === false ? 'blue' : 'purple'" style="width: 38px; height: 38px; font-size: 1rem;">
                    <i class="bi" [ngClass]="m.isRead === false ? 'bi-envelope-fill' : 'bi-envelope-open'"></i>
                  </div>
                </div>

                <div>
                  <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <span class="badge bg-primary-subtle text-primary small fw-bold">{{ m.receiverRole }}</span>
                    <span class="badge bg-light text-dark border small" *ngIf="m.title">{{ m.title }}</span>
                    <span *ngIf="m.isRead === false" class="badge bg-primary text-white small" style="font-size: 10px;">NEW</span>
                    <span class="text-muted small">&bull;</span>
                    <small class="text-muted">{{ getNotificationDate(m) | date:'medium' }}</small>
                  </div>
                  <p class="mb-0 text-dark fw-medium" style="font-size: 0.95rem;">{{ m.message }}</p>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="mails.length === 0" class="text-center py-5">
              <i class="bi bi-inbox text-muted fs-1 mb-2 d-block"></i>
              <h6 class="text-muted">Your mailbox is empty.</h6>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-shimmer {
      background: linear-gradient(90deg, #edf2f7 25%, #e2e8f0 50%, #edf2f7 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      display: inline-block;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .skeleton-shimmer {
        animation: none;
        background: #e2e8f0;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  mails: NotificationItem[] = [];
  isLoading: boolean = true;
  hasError: boolean = false;
  markingRead: boolean = false;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  get unreadCount(): number {
    return this.mails.filter(m => m.isRead === false).length;
  }

  loadNotifications(): void {
    const user = this.authService.currentUserValue;
    if (!user) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    this.notificationService.getNotifications(user.userId).subscribe({
      next: res => {
        this.isLoading = false;
        if (res.success) {
          this.mails = res.data;
          this.hasError = false;
        }
      },
      error: () => {
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }

  getNotificationDate(notification: NotificationItem): Date | null {
    const dateStr = notification.createdAt || notification.createdDate;
    return dateStr ? new Date(dateStr) : null;
  }

  markAllRead(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    this.markingRead = true;
    this.mails.forEach(m => m.isRead = true);

    this.notificationService.markAllAsRead(user.userId).subscribe({
      next: () => {
        this.markingRead = false;
      },
      error: () => {
        this.markingRead = false;
      }
    });
  }
}
