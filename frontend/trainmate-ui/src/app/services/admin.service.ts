import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  AdminDashboard,
  ApiResponse,
  Cohort,
  CreateTrainerRequest,
  Trainer,
  TrainerOverrideRequest,
  PagedResponse
} from '../models/models';
import { environment } from '../../environments/environment';
import { HttpCacheService } from './http-cache.service';

export interface AdminCohortsFilterState {
  page: number;
  size: number;
  sort: string;
  query: string;
  status: string;
  serviceLine: string;
}

export interface AdminTrainersFilterState {
  page: number;
  size: number;
  sort: string;
  search: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  // Persistent component filter and pagination state across route navigation
  public cohortsState: AdminCohortsFilterState = {
    page: 0,
    size: 20,
    sort: 'createdDate,desc',
    query: '',
    status: '',
    serviceLine: ''
  };

  public trainersState: AdminTrainersFilterState = {
    page: 0,
    size: 20,
    sort: 'id,asc',
    search: ''
  };

  constructor(
    private http: HttpClient,
    private cache: HttpCacheService
  ) {}

  getDashboard(forceRefresh: boolean = false): Observable<ApiResponse<AdminDashboard>> {
    const url = `${this.apiUrl}/dashboard`;
    return this.cache.get<ApiResponse<AdminDashboard>>(url, {
      ttlMs: 45_000,
      forceRefresh,
      tag: 'dashboards'
    });
  }

  peekDashboard(): ApiResponse<AdminDashboard> | null {
    return this.cache.peek<ApiResponse<AdminDashboard>>(`${this.apiUrl}/dashboard`);
  }

  getAllCohorts(): Observable<ApiResponse<Cohort[]>> {
    return this.cache.get<ApiResponse<Cohort[]>>(`${this.apiUrl}/cohorts`, {
      ttlMs: 45_000,
      tag: 'cohorts'
    });
  }

  getAllCohortsPaged(
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

    const url = `${this.apiUrl}/cohorts/paged?${params.toString()}`;
    return this.cache.get<ApiResponse<PagedResponse<Cohort>>>(url, {
      ttlMs: 30_000,
      forceRefresh,
      tag: 'cohorts'
    });
  }

  peekCohortsPaged(
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
    return this.cache.peek<ApiResponse<PagedResponse<Cohort>>>(`${this.apiUrl}/cohorts/paged?${params.toString()}`);
  }

  getDistinctServiceLines(): Observable<ApiResponse<string[]>> {
    const url = `${this.apiUrl}/cohorts/service-lines`;
    return this.cache.get<ApiResponse<string[]>>(url, {
      ttlMs: 300_000,
      tag: 'cohorts'
    });
  }

  getAllTrainers(): Observable<ApiResponse<Trainer[]>> {
    return this.cache.get<ApiResponse<Trainer[]>>(`${this.apiUrl}/trainers`, {
      ttlMs: 60_000,
      tag: 'trainers'
    });
  }

  getAllTrainersPaged(
    search?: string,
    page: number = 0,
    size: number = 20,
    sort: string = 'id,asc',
    forceRefresh: boolean = false
  ): Observable<ApiResponse<PagedResponse<Trainer>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search && search.trim()) params = params.set('search', search.trim());

    const url = `${this.apiUrl}/trainers/paged?${params.toString()}`;
    return this.cache.get<ApiResponse<PagedResponse<Trainer>>>(url, {
      ttlMs: 30_000,
      forceRefresh,
      tag: 'trainers'
    });
  }

  peekTrainersPaged(
    search?: string,
    page: number = 0,
    size: number = 20,
    sort: string = 'id,asc'
  ): ApiResponse<PagedResponse<Trainer>> | null {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    if (search && search.trim()) params = params.set('search', search.trim());
    return this.cache.peek<ApiResponse<PagedResponse<Trainer>>>(`${this.apiUrl}/trainers/paged?${params.toString()}`);
  }

  createTrainer(request: CreateTrainerRequest): Observable<ApiResponse<Trainer>> {
    return this.http.post<ApiResponse<Trainer>>(`${this.apiUrl}/trainers`, request).pipe(
      tap(() => this.cache.invalidateTag(['trainers', 'dashboards']))
    );
  }

  updateTrainer(trainerId: number, request: CreateTrainerRequest): Observable<ApiResponse<Trainer>> {
    return this.http.put<ApiResponse<Trainer>>(`${this.apiUrl}/trainers/${trainerId}`, request).pipe(
      tap(() => this.cache.invalidateTag(['trainers', 'dashboards']))
    );
  }

  toggleTrainerAvailability(trainerId: number, available: boolean): Observable<ApiResponse<Trainer>> {
    return this.http.patch<ApiResponse<Trainer>>(`${this.apiUrl}/trainers/${trainerId}/status?available=${available}`, {}).pipe(
      tap(() => this.cache.invalidateTag(['trainers', 'dashboards']))
    );
  }

  deleteTrainer(trainerId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/trainers/${trainerId}`).pipe(
      tap(() => this.cache.invalidateTag(['trainers', 'dashboards', 'cohorts']))
    );
  }

  bulkDeleteTrainers(ids: number[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/trainers/bulk-delete`, { ids }).pipe(
      tap(() => this.cache.invalidateTag(['trainers', 'dashboards', 'cohorts']))
    );
  }

  bulkDeleteCohorts(ids: number[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${environment.apiUrl}/cohorts/bulk-delete`, { ids }).pipe(
      tap(() => this.cache.invalidateTag(['cohorts', 'dashboards', 'trainers']))
    );
  }

  reassignTrainer(cohortId: number, request: TrainerOverrideRequest, adminUserId: number): Observable<ApiResponse<Cohort>> {
    return this.http.put<ApiResponse<Cohort>>(`${this.apiUrl}/cohorts/${cohortId}/trainer?adminUserId=${adminUserId}`, request).pipe(
      tap(() => this.cache.invalidateTag(['cohorts', 'trainers', 'dashboards']))
    );
  }

  exportAllocationReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/cohorts/export`, {
      responseType: 'blob'
    });
  }
}
