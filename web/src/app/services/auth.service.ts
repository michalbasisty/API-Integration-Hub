import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadUserFromStorage();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser && !!this.getToken();
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    if (token) {
      // Try to get user profile, but don't fail silently
      this.apiService.getProfile().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
        },
        error: () => {
          // Token might be invalid, clear it
          this.logout();
        }
      });
    }
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.apiService.login(credentials).pipe(
      tap(response => {
        if (response.access_token) {
          this.setToken(response.access_token);
          // Optionally set refresh token if provided
          if (response.refresh_token) {
            localStorage.setItem('refresh_token', response.refresh_token);
          }
          // Load user profile after login
          this.apiService.getProfile().subscribe(user => {
            this.currentUserSubject.next(user);
          });
        }
      })
    );
  }

  register(userData: { email: string; password: string; firstName?: string; lastName?: string }): Observable<any> {
    return this.apiService.register(userData);
  }

  logout(): void {
    // Clear auth data immediately for better UX
    this.clearAuthData();
    // Attempt server logout in background (don't block UI)
    this.apiService.logout().subscribe({
      error: (error) => {
        console.warn('Server logout failed:', error);
        // Auth data is already cleared, so this is fine
      }
    });
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Note: refreshToken method can be added if backend supports refresh tokens
  // For now, we'll rely on login when tokens expire
}