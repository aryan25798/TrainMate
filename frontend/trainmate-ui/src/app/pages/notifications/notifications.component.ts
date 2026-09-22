import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { NotificationItem } from '../../models/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Mailbox</h1>
          <p class="page-subtitle">Internal messages, cohort assignment alerts, and system notifications.</p>
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="text-muted small">
            {{ mails.length }} message(s) &bull; {{ unreadCount }} unread
          </span>
          <button
            *ngIf="unreadCount > 0"
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

      <!-- Mail List -->
      <div class="content-card">
        <div class="p-0">
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
                  <small class="text-muted">{{ (m.createdAt || m.createdDate) | date:'medium' }}</small>
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
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  mails: NotificationItem[] = [];
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
    if (!user) return;

    this.notificationService.getNotifications(user.userId).subscribe({
      next: res => {
        if (res.success) {
          this.mails = res.data;
        }
      }
    });
  }

  markAllRead(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    this.markingRead = true;
    // Optimistically mark all notifications as read in UI
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
