import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, CoachDashboard, Cohort, CohortUploadResponse, PagedResponse } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private apiUrl = `${environment.apiUrl}/coach`;

  constructor(private http: HttpClient) {}

  getDashboard(coachId: number): Observable<ApiResponse<CoachDashboard>> {
    return this.http.get<ApiResponse<CoachDashboard>>(`${this.apiUrl}/${coachId}/dashboard`);
  }

  getCohorts(coachId: number): Observable<ApiResponse<Cohort[]>> {
    return this.http.get<ApiResponse<Cohort[]>>(`${this.apiUrl}/${coachId}/cohorts`);
  }

  getCohortsPaged(coachId: number, page: number = 0, size: number = 15, sort: string = 'createdDate,desc'): Observable<ApiResponse<PagedResponse<Cohort>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<ApiResponse<PagedResponse<Cohort>>>(`${this.apiUrl}/${coachId}/cohorts/paged`, { params });
  }

  uploadCohorts(coachId: number, file: File): Observable<ApiResponse<CohortUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<CohortUploadResponse>>(`${this.apiUrl}/${coachId}/cohorts/upload`, formData);
  }

  createCohort(coachId: number, req: import('../models/models').CreateCohortRequest): Observable<ApiResponse<Cohort>> {
    return this.http.post<ApiResponse<Cohort>>(`${this.apiUrl}/${coachId}/cohorts`, req);
  }
}
