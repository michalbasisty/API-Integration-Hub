import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private get(url: string, options?: any): Observable<any> {
    return this.http.get(url, { ...options, headers: this.getHeaders() });
  }

  private post(url: string, body: any, options?: any): Observable<any> {
    return this.http.post(url, body, { ...options, headers: this.getHeaders() });
  }

  private put(url: string, body: any, options?: any): Observable<any> {
    return this.http.put(url, body, { ...options, headers: this.getHeaders() });
  }

  private delete(url: string, options?: any): Observable<any> {
    return this.http.delete(url, { ...options, headers: this.getHeaders() });
  }

  // Authentication API
  register(credentials: { email: string; password: string; firstName?: string; lastName?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, credentials, { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) });
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials, { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) });
  }

  logout(): Observable<any> {
    return this.post(`${this.apiUrl}/auth/logout`, {});
  }

  getProfile(): Observable<any> {
    return this.get(`${this.apiUrl}/auth/me`);
  }

  getBackendHealth(): Observable<any> {
    return this.get(`${this.apiUrl}/health`);
  }

  getBackendStatus(): Observable<any> {
    return this.get(`${this.apiUrl}/status`);
  }

  getProjects(): Observable<any> {
    return this.get(`${this.apiUrl}/projects`);
  }

  analyzeMetrics(data: any): Observable<any> {
    return this.post(`${this.apiUrl}/analyze`, data);
  }

  // Monitors API
  getMonitors(): Observable<any> {
    return this.get(`${this.apiUrl}/monitors`);
  }

  getMonitor(id: string): Observable<any> {
    return this.get(`${this.apiUrl}/monitors/${id}`);
  }

  createMonitor(payload: any): Observable<any> {
    return this.post(`${this.apiUrl}/monitors`, payload);
  }

  updateMonitor(id: string, payload: any): Observable<any> {
    return this.put(`${this.apiUrl}/monitors/${id}`, payload);
  }

  deleteMonitor(id: string): Observable<any> {
    return this.delete(`${this.apiUrl}/monitors/${id}`);
  }

  getMonitorMetrics(id: string): Observable<any> {
    return this.get(`${this.apiUrl}/monitors/${id}/metrics`);
  }

  checkMonitor(id: string): Observable<any> {
    return this.post(`${this.apiUrl}/monitors/${id}/check`, {});
  }

  getMonitorMetricsSummary(id: string, days = 7): Observable<any> {
    return this.get(`${this.apiUrl}/monitors/${id}/metrics/summary`, { params: { days } as any });
  }

  getMonitorUptimeDaily(id: string, days = 30): Observable<any> {
    return this.get(`${this.apiUrl}/monitors/${id}/uptime/daily`, { params: { days } as any });
  }

  // Alerts
  getAlerts(): Observable<any> {
    return this.get(`${this.apiUrl}/alerts`);
  }

  resolveAlert(id: string): Observable<any> {
    return this.post(`${this.apiUrl}/alerts/${id}/resolve`, {});
  }
}
