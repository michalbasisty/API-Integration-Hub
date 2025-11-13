import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getBackendHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }

  getBackendStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status`);
  }

  getProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`);
  }

  analyzeMetrics(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/analyze`, data);
  }

  // Monitors API
  getMonitors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/monitors`);
  }

  getMonitor(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/monitors/${id}`);
  }

  createMonitor(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/monitors`, payload);
  }

  updateMonitor(id: string, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/monitors/${id}`, payload);
  }

  deleteMonitor(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/monitors/${id}`);
  }

  getMonitorMetrics(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/monitors/${id}/metrics`);
  }

  checkMonitor(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/monitors/${id}/check`, {});
  }

  getMonitorMetricsSummary(id: string, days = 7): Observable<any> {
    return this.http.get(`${this.apiUrl}/monitors/${id}/metrics/summary`, { params: { days } as any });
  }

  getMonitorUptimeDaily(id: string, days = 30): Observable<any> {
    return this.http.get(`${this.apiUrl}/monitors/${id}/uptime/daily`, { params: { days } as any });
  }

  // Alerts
  getAlerts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/alerts`);
  }

  resolveAlert(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/alerts/${id}/resolve`, {});
  }
}
