import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type BackendConnectionState = 'CONNECTED' | 'WAKING_UP' | 'DEGRADED';

export interface BackendStatusInfo {
  state: BackendConnectionState;
  attempt: number;
  maxAttempts: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BackendStatusService {
  private statusSubject = new BehaviorSubject<BackendStatusInfo>({
    state: 'CONNECTED',
    attempt: 0,
    maxAttempts: 4
  });

  status$: Observable<BackendStatusInfo> = this.statusSubject.asObservable();

  constructor(private http: HttpClient) {}

  public get currentStatus(): BackendStatusInfo {
    return this.statusSubject.value;
  }

  public notifyWakeup(attempt: number, maxAttempts: number): void {
    this.statusSubject.next({
      state: 'WAKING_UP',
      attempt,
      maxAttempts,
      message: `Connecting to cloud server... Container is waking up from standby (${attempt}/${maxAttempts}).`
    });
  }

  public notifyConnected(): void {
    if (this.statusSubject.value.state !== 'CONNECTED') {
      this.statusSubject.next({
        state: 'CONNECTED',
        attempt: 0,
        maxAttempts: 4,
        message: 'Connected to server'
      });
    }
  }

  public notifyDegraded(errorMessage?: string): void {
    this.statusSubject.next({
      state: 'DEGRADED',
      attempt: 0,
      maxAttempts: 4,
      message: errorMessage || 'Server is temporarily unreachable. The cloud container may still be starting up.'
    });
  }

  public retryConnection(): Observable<any> {
    this.notifyWakeup(1, 4);
    return this.http.get(`${environment.apiUrl}/health`);
  }
}
