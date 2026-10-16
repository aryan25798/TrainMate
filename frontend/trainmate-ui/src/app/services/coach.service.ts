import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  ApiResponse,
  CoachDashboard,
  Cohort,
  CohortUploadResponse,
  CreateCohortRequest,
  PagedResponse
} from '../models/models';
import { environment } from '../../environments/environment';
import { HttpCacheService } from './http-cache.service';
import { AdminCohortsFilterState } from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private apiUrl = `${environment.apiUrl}/coach`;

  public cohortsState: AdminCohortsFilterState = {
    page: 0,
    size: 20,
    sort: 'createdDate,desc',
    query: '',
    status: '',
    serviceLine: ''
  };

  constructor(
    private http: HttpClient,
    private cache: HttpCacheService
  ) {}

  getDashboard(coachId: number, forceRefresh: boolean = false): Observable<ApiResponse<CoachDashboard>> {
    const url = `${this.apiUrl}/${coachId}/dashboard`;
    return this.cache.get<ApiResponse<CoachDashboard>>(url, {
      ttlMs: 45_000,
      forceRefresh,
      tag: 'dashboards'
    });
  }

  peekDashboard(coachId: number): ApiResponse<CoachDashboard> | null {
    return this.cache.peek<ApiResponse<CoachDashboard>>(`${this.apiUrl}/${coachId}/dashboard`);
  }

  getCohorts(coachId: number): Observable<ApiResponse<Cohort[]>> {
    return this.cache.get<ApiResponse<Cohort[]>>(`${this.apiUrl}/${coachId}/cohorts`, {
      ttlMs: 45_000,
      tag: 'cohorts'
    });
  }

  getCohortsPaged(
    coachId: number,
    query?: string,
    status?: string,
    serviceLine?: string,
    page: number = 0,
    size: number = 20,
    sort: string = 'createdDate,desc',
    forceRefresh: boolean = false
  ): Observable<ApiResponse<PagedResponse<Cohort>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (query && query.trim()) params = params.set('query', query.trim());
    if (status && status.trim()) params = params.set('status', status.trim());
    if (serviceLine && serviceLine.trim()) params = params.set('serviceLine', serviceLine.trim());

    const url = `${this.apiUrl}/${coachId}/cohorts/paged?${params.toString()}`;
    return this.cache.get<ApiResponse<PagedResponse<Cohort>>>(url, {
      ttlMs: 30_000,
      forceRefresh,
      tag: 'cohorts'
    });
  }

  peekCohortsPaged(
    coachId: number,
    query?: string,
    status?: string,
    serviceLine?: string,
    page: number = 0,
    size: number = 20,
    sort: string = 'createdDate,desc'
  ): ApiResponse<PagedResponse<Cohort>> | null {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (query && query.trim()) params = params.set('query', query.trim());
    if (status && status.trim()) params = params.set('status', status.trim());
    if (serviceLine && serviceLine.trim()) params = params.set('serviceLine', serviceLine.trim());

    return this.cache.peek<ApiResponse<PagedResponse<Cohort>>>(`${this.apiUrl}/${coachId}/cohorts/paged?${params.toString()}`);
  }

  uploadCohorts(coachId: number, file: File): Observable<ApiResponse<CohortUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<CohortUploadResponse>>(`${this.apiUrl}/${coachId}/cohorts/upload`, formData).pipe(
      tap(() => this.cache.invalidateTag(['cohorts', 'dashboards', 'trainers']))
    );
  }

  createCohort(coachId: number, req: CreateCohortRequest): Observable<ApiResponse<Cohort>> {
    return this.http.post<ApiResponse<Cohort>>(`${this.apiUrl}/${coachId}/cohorts`, req).pipe(
      tap(() => this.cache.invalidateTag(['cohorts', 'dashboards', 'trainers']))
    );
  }
}
