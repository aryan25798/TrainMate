import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, CoachDashboard, Cohort, CohortUploadResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private apiUrl = 'http://localhost:8080/api/coaches';

  constructor(private http: HttpClient) {}

  getDashboard(coachId: number): Observable<ApiResponse<CoachDashboard>> {
    return this.http.get<ApiResponse<CoachDashboard>>(`${this.apiUrl}/${coachId}/dashboard`);
  }

  getCohorts(coachId: number): Observable<ApiResponse<Cohort[]>> {
    return this.http.get<ApiResponse<Cohort[]>>(`${this.apiUrl}/${coachId}/cohorts`);
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
