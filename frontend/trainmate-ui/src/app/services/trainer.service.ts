import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Cohort, TrainerDashboard, PagedResponse } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  private apiUrl = `${environment.apiUrl}/trainers`;

  constructor(private http: HttpClient) {}

  getDashboard(trainerId: number): Observable<ApiResponse<TrainerDashboard>> {
    return this.http.get<ApiResponse<TrainerDashboard>>(`${this.apiUrl}/${trainerId}/dashboard`);
  }

  getCohorts(trainerId: number): Observable<ApiResponse<Cohort[]>> {
    return this.http.get<ApiResponse<Cohort[]>>(`${this.apiUrl}/${trainerId}/cohorts`);
  }

  getCohortsPaged(trainerId: number, page: number = 0, size: number = 15, sort: string = 'startDate,asc'): Observable<ApiResponse<PagedResponse<Cohort>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<ApiResponse<PagedResponse<Cohort>>>(`${this.apiUrl}/${trainerId}/cohorts/paged`, { params });
  }
}
