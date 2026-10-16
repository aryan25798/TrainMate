import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiResponse, NotificationItem, PagedResponse } from '../models/models';
import { environment } from '../../environments/environment';
import { HttpCacheService } from './http-cache.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cache: HttpCacheService
  ) {}

  getNotifications(userId: number, forceRefresh: boolean = false): Observable<ApiResponse<NotificationItem[]>> {
    const url = `${this.apiUrl}/${userId}`;
    return this.cache.get<ApiResponse<NotificationItem[]>>(url, {
      ttlMs: 30_000,
      forceRefresh,
      tag: 'notifications'
    });
  }

  getNotificationsPaged(
    userId: number,
    page: number = 0,
    size: number = 20,
    sort: string = 'createdDate,desc',
    forceRefresh: boolean = false
  ): Observable<ApiResponse<PagedResponse<NotificationItem>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    const url = `${this.apiUrl}/${userId}/paged?${params.toString()}`;
    return this.cache.get<ApiResponse<PagedResponse<NotificationItem>>>(url, {
      ttlMs: 30_000,
      forceRefresh,
      tag: 'notifications'
    });
  }

  markAllAsRead(userId: number): Observable<ApiResponse<number>> {
    return this.http.put<ApiResponse<number>>(`${this.apiUrl}/${userId}/read-all`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
        this.cache.invalidateTag('notifications');
      })
    );
  }

  getUnreadCount(userId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/${userId}/unread-count`).pipe(
      tap(res => {
        if (res && res.success && typeof res.data === 'number') {
          this.unreadCountSubject.next(res.data);
        }
      })
    );
  }

  setUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
}
