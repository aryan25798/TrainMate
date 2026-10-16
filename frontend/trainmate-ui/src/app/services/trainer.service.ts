import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Cohort, TrainerDashboard, PagedResponse } from '../models/models';
import { environment } from '../../environments/environment';
import { HttpCacheService } from './http-cache.service';

export interface TrainerCohortsFilterState {
  page: number;
  size: number;
  sort: string;
  query: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  private apiUrl = `${environment.apiUrl}/trainers`;

  public cohortsState: TrainerCohortsFilterState = {
    page: 0,
    size: 20,
    sort: 'startDate,asc',
    query: '',
    status: ''
  };

  constructor(
    private http: HttpClient,
    private cache: HttpCacheService
  ) {}

  getDashboard(trainerId: number, forceRefresh: boolean = false): Observable<ApiResponse<TrainerDashboard>> {
    const url = `${this.apiUrl}/${trainerId}/dashboard`;
    return this.cache.get<ApiResponse<TrainerDashboard>>(url, {
      ttlMs: 45_000,
      forceRefresh,
      tag: 'dashboards'
    });
  }

  peekDashboard(trainerId: number): ApiResponse<TrainerDashboard> | null {
    return this.cache.peek<ApiResponse<TrainerDashboard>>(`${this.apiUrl}/${trainerId}/dashboard`);
  }

  getCohorts(trainerId: number): Observable<ApiResponse<Cohort[]>> {
    return this.cache.get<ApiResponse<Cohort[]>>(`${this.apiUrl}/${trainerId}/cohorts`, {
      ttlMs: 45_000,
      tag: 'cohorts'
    });
  }

  getCohortsPaged(
    trainerId: number,
    query?: string,
    status?: string,
    page: number = 0,
    size: number = 20,
    sort: string = 'startDate,asc',
    forceRefresh: boolean = false
  ): Observable<ApiResponse<PagedResponse<Cohort>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (query && query.trim()) params = params.set('query', query.trim());
    if (status && status.trim()) params = params.set('status', status.trim());

    const url = `${this.apiUrl}/${trainerId}/cohorts/paged?${params.toString()}`;
    return this.cache.get<ApiResponse<PagedResponse<Cohort>>>(url, {
      ttlMs: 30_000,
      forceRefresh,
      tag: 'cohorts'
    });
  }

  peekCohortsPaged(
    trainerId: number,
    query?: string,
    status?: string,
    page: number = 0,
    size: number = 20,
    sort: string = 'startDate,asc'
  ): ApiResponse<PagedResponse<Cohort>> | null {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (query && query.trim()) params = params.set('query', query.trim());
    if (status && status.trim()) params = params.set('status', status.trim());

    return this.cache.peek<ApiResponse<PagedResponse<Cohort>>>(`${this.apiUrl}/${trainerId}/cohorts/paged?${params.toString()}`);
  }
}
