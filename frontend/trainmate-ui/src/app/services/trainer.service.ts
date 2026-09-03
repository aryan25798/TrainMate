import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Cohort, TrainerDashboard } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  private apiUrl = 'http://localhost:8080/api/trainers';

  constructor(private http: HttpClient) {}

  getDashboard(trainerId: number): Observable<ApiResponse<TrainerDashboard>> {
    return this.http.get<ApiResponse<TrainerDashboard>>(`${this.apiUrl}/${trainerId}/dashboard`);
  }

  getCohorts(trainerId: number): Observable<ApiResponse<Cohort[]>> {
    return this.http.get<ApiResponse<Cohort[]>>(`${this.apiUrl}/${trainerId}/cohorts`);
  }
}
