import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminDashboard,
  ApiResponse,
  Cohort,
  Trainer,
  TrainerOverrideRequest
} from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ApiResponse<AdminDashboard>> {
    return this.http.get<ApiResponse<AdminDashboard>>(`${this.apiUrl}/dashboard`);
  }

  getAllCohorts(): Observable<ApiResponse<Cohort[]>> {
    return this.http.get<ApiResponse<Cohort[]>>(`${this.apiUrl}/cohorts`);
  }

  getAllTrainers(): Observable<ApiResponse<Trainer[]>> {
    return this.http.get<ApiResponse<Trainer[]>>(`${this.apiUrl}/trainers`);
  }

  reassignTrainer(cohortId: number, request: TrainerOverrideRequest, adminUserId: number): Observable<ApiResponse<Cohort>> {
    return this.http.put<ApiResponse<Cohort>>(`${this.apiUrl}/cohorts/${cohortId}/trainer?adminUserId=${adminUserId}`, request);
  }

  exportAllocationReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/cohorts/export`, {
      responseType: 'blob'
    });
  }
}
