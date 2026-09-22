import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Cohort, CreateCohortRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CohortService {
  private apiUrl = `${environment.apiUrl}/cohorts`;

  constructor(private http: HttpClient) {}

  getCohort(cohortId: number): Observable<ApiResponse<Cohort>> {
    return this.http.get<ApiResponse<Cohort>>(`${this.apiUrl}/${cohortId}`);
  }

  deleteCohort(cohortId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${cohortId}`);
  }

  updateCohort(cohortId: number, data: CreateCohortRequest): Observable<ApiResponse<Cohort>> {
    return this.http.put<ApiResponse<Cohort>>(`${this.apiUrl}/${cohortId}`, data);
  }

  updateCohortStatus(cohortId: number, status: string): Observable<ApiResponse<Cohort>> {
    return this.http.patch<ApiResponse<Cohort>>(`${this.apiUrl}/${cohortId}/status?status=${status}`, {});
  }

  reallocateTrainer(cohortId: number): Observable<ApiResponse<Cohort>> {
    return this.http.post<ApiResponse<Cohort>>(`${this.apiUrl}/${cohortId}/reallocate`, {});
  }

  downloadSampleTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/sample-template`, {
      responseType: 'blob'
    });
  }
}
