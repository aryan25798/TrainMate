import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, finalize, catchError, throwError, retry, timer, tap } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { BackendStatusService } from '../services/backend-status.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private excludedUrls = [
    '/auth/login',
    '/actuator',
    '/health'
  ];

  constructor(
    private loadingService: LoadingService,
    private backendStatusService: BackendStatusService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isGet = request.method === 'GET';
    const isExcluded = this.excludedUrls.some(url => request.url.includes(url));
    const isExplicitBlocking = request.headers.has('X-Blocking-Operation');

    const cleanRequest = isExplicitBlocking
      ? request.clone({ headers: request.headers.delete('X-Blocking-Operation') })
      : request;

    if (isExplicitBlocking) {
      this.loadingService.setLoading('global', true);
    }

    let retryAttempt = 0;
    // Only auto-retry idempotent GET requests to avoid duplicate operations
    const maxRetries = (isGet && !isExcluded) ? 3 : 0;

    return next.handle(cleanRequest).pipe(
      retry({
        count: maxRetries,
        delay: (error: HttpErrorResponse, count) => {
          retryAttempt = count;
          // Check for Render sleep, network dropped, or gateway cold-start timeouts
          const isServerSleeping = error.status === 0 || error.status === 502 || error.status === 503 || error.status === 504;
          if (isGet && isServerSleeping) {
            this.backendStatusService.notifyWakeup(count, maxRetries + 1);
            // Bounded exponential backoff with jitter: ~2.5s, 5s, 7.5s
            const delayMs = count * 2500 + Math.floor(Math.random() * 500);
            return timer(delayMs);
          }
          return throwError(() => error);
        }
      }),
      tap({
        next: () => {
          if (retryAttempt > 0 || this.backendStatusService.currentStatus.state === 'WAKING_UP') {
            this.backendStatusService.notifyConnected();
          }
        }
      }),
      finalize(() => {
        if (isExplicitBlocking) {
          this.loadingService.setLoading('global', false);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (isGet && retryAttempt >= maxRetries && (error.status === 0 || error.status >= 502)) {
          this.backendStatusService.notifyDegraded(
            'The cloud server is taking longer than expected to wake up from standby.'
          );
        }
        return throwError(() => error);
      })
    );
  }
}