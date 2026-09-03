import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Cohort } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CohortService {
  private apiUrl = 'http://localhost:8080/api/cohorts';

  constructor(private http: HttpClient) {}

  getCohort(cohortId: number): Observable<ApiResponse<Cohort>> {
    return this.http.get<ApiResponse<Cohort>>(`${this.apiUrl}/${cohortId}`);
  }

  downloadSampleTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/sample-template`, {
      responseType: 'blob'
    });
  }
}
