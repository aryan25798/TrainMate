import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingMap = new Map<string, number>();

  loading$ = this.loadingSubject.asObservable();

  setLoading(key: string, loading: boolean): void {
    if (loading) {
      const count = (this.loadingMap.get(key) || 0) + 1;
      this.loadingMap.set(key, count);
    } else {
      const count = Math.max(0, (this.loadingMap.get(key) || 1) - 1);
      if (count === 0) {
        this.loadingMap.delete(key);
      } else {
        this.loadingMap.set(key, count);
      }
    }
    this.loadingSubject.next(this.loadingMap.size > 0);
  }

  isLoading(key?: string): boolean {
    if (key) {
      return (this.loadingMap.get(key) || 0) > 0;
    }
    return this.loadingMap.size > 0;
  }
}