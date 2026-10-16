import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse, Cohort, CreateCohortRequest } from '../models/models';
import { environment } from '../../environments/environment';
import { HttpCacheService } from './http-cache.service';

@Injectable({
  providedIn: 'root'
})
export class CohortService {
  private apiUrl = `${environment.apiUrl}/cohorts`;

  constructor(
    private http: HttpClient,
    private cache: HttpCacheService
  ) {}

  getCohort(cohortId: number): Observable<ApiResponse<Cohort>> {
    return this.http.get<ApiResponse<Cohort>>(`${this.apiUrl}/${cohortId}`);
  }

  deleteCohort(cohortId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${cohortId}`).pipe(
      tap(() => this.cache.invalidateTag(['cohorts', 'dashboards', 'trainers']))
    );
  }

  bulkDeleteCohorts(ids: number[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/bulk-delete`, { ids }).pipe(
      tap(() => this.cache.invalidateTag(['cohorts', 'dashboards', 'trainers']))
    );
  }

  updateCohort(cohortId: number, data: CreateCohortRequest): Observable<ApiResponse<Cohort>> {
    return this.http.put<ApiResponse<Cohort>>(`${this.apiUrl}/${cohortId}`, data).pipe(
      tap(() => this.cache.invalidateTag(['cohorts', 'dashboards', 'trainers']))
    );
  }

  updateCohortStatus(cohortId: number, status: string): Observable<ApiResponse<Cohort>> {
    return this.http.patch<ApiResponse<Cohort>>(`${this.apiUrl}/${cohortId}/status?status=${status}`, {}).pipe(
      tap(() => this.cache.invalidateTag(['cohorts', 'dashboards']))
    );
  }

  reallocateTrainer(cohortId: number): Observable<ApiResponse<Cohort>> {
    return this.http.post<ApiResponse<Cohort>>(`${this.apiUrl}/${cohortId}/reallocate`, {}).pipe(
      tap(() => this.cache.invalidateTag(['cohorts', 'dashboards', 'trainers']))
    );
  }

  downloadSampleTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/sample-template`, {
      responseType: 'blob'
    });
  }
}
