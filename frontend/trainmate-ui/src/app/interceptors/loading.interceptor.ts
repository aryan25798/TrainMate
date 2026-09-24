import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, finalize, catchError, throwError } from 'rxjs';
import { LoadingService } from './loading.service';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private excludedUrls = [
    '/auth/login',
    '/actuator',
    '/health'
  ];

  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip loading for excluded URLs
    const shouldShowLoading = !this.excludedUrls.some(url => request.url.includes(url));
    
    if (shouldShowLoading) {
      this.loadingService.setLoading('global', true);
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (shouldShowLoading) {
          this.loadingService.setLoading('global', false);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Don't show error toast for 401 on login endpoint
        if (error.status === 401 && request.url.includes('/auth/login')) {
          return throwError(() => error);
        }
        
        let errorMessage = 'An unexpected error occurred';
        
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Network error: ${error.error.message}`;
        } else {
          switch (error.status) {
            case 400:
              errorMessage = error.error?.message || 'Bad request';
              break;
            case 401:
              if (!request.url.includes('/auth/login')) {
                errorMessage = 'Session expired. Please log in again.';
                this.authService.logout();
                this.router.navigate(['/login']);
              }
              break;
            case 403:
              errorMessage = 'Access denied. You do not have permission for this action.';
              break;
            case 404:
              errorMessage = 'Resource not found';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
          }
        }
        
        this.toastService.error(errorMessage);
        return throwError(() => error);
      })
    );
  }
}