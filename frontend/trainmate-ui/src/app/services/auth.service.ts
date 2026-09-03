import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, User, UserRole } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUserFromStorage(): User | null {
    const data = localStorage.getItem('trainmate_user');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        localStorage.removeItem('trainmate_user');
      }
    }
    return null;
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  public getRole(): UserRole | null {
    return this.currentUserSubject.value?.role || null;
  }

  public login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.userId && response.role && response.name && response.loginId) {
          const user: User = {
            userId: response.userId,
            loginId: response.loginId,
            name: response.name,
            role: response.role,
            coachId: response.coachId,
            trainerId: response.trainerId
          };
          localStorage.setItem('trainmate_user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  public logout(): void {
    localStorage.removeItem('trainmate_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  public redirectBasedOnRole(): void {
    const role = this.getRole();
    if (role === 'COACH') {
      this.router.navigate(['/coach/dashboard']);
    } else if (role === 'TRAINER') {
      this.router.navigate(['/trainer/dashboard']);
    } else if (role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
