import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="alerts">
      <h2>🚨 Alerts</h2>

      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-number">{{ alerts.length }}</span>
          <span class="stat-label">Total Alerts</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ unresolvedCount }}</span>
          <span class="stat-label">Unresolved</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ resolvedCount }}</span>
          <span class="stat-label">Resolved</span>
        </div>
      </div>

      <div class="toolbar">
        <button class="btn-primary" (click)="refresh()">🔄 Refresh</button>
        <div class="filter-group">
          <label>
            Status:
            <select [(ngModel)]="statusFilter" (change)="applyFilters()">
              <option value="all">All Alerts</option>
              <option value="unresolved">Unresolved</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>
          <label>
            Severity:
            <select [(ngModel)]="severityFilter" (change)="applyFilters()">
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </label>
        </div>
      </div>

      <div class="pagination">
        <div class="page-info">
          Showing {{ (page * pageSize) + 1 }}-{{ getMin((page + 1) * pageSize, filteredAlerts.length) }} of {{ filteredAlerts.length }} alerts
        </div>
        <div class="pager">
          <button class="btn-nav" (click)="prev()" [disabled]="page===0">⬅️ Prev</button>
          <span class="page-current">Page {{ page+1 }} of {{ totalPages }}</span>
          <button class="btn-nav" (click)="next()" [disabled]="page >= totalPages - 1">Next ➡️</button>
        </div>
      </div>

      <div class="list">
        <div class="item" *ngFor="let alert of pagedAlerts; trackBy: trackByAlertId"
             [class.resolved]="alert.is_resolved"
             [class.critical]="alert.severity === 'critical'"
             [class.warning]="alert.severity === 'warning'"
             [class.info]="alert.severity === 'info'">

          <div class="status-indicator">
            <div class="severity-dot" [class]="alert.severity"></div>
            <div class="resolution-status" [class.resolved]="alert.is_resolved">
              {{ alert.is_resolved ? '✅' : '⏳' }}
            </div>
          </div>

          <div class="meta">
            <div class="alert-header">
              <span class="alert-type">{{ alert.alert_type || 'Alert' }}</span>
              <span class="severity-badge" [class]="alert.severity">{{ alert.severity }}</span>
            </div>
            <div class="message">{{ alert.message }}</div>
            <div class="timestamp">{{ formatDate(alert.created_at) }}</div>
          </div>

          <div class="actions">
            <button class="btn-resolve"
                    (click)="resolve(alert.id)"
                    [disabled]="alert.is_resolved"
                    *ngIf="!alert.is_resolved">
              ✅ Resolve
            </button>
            <span class="resolved-text" *ngIf="alert.is_resolved">
              Resolved {{ formatDate(alert.resolved_at) }}
            </span>
          </div>
        </div>

        <div *ngIf="filteredAlerts.length === 0" class="empty-state">
          <div class="empty-icon">✅</div>
          <h4>No Alerts Found</h4>
          <p>{{ getEmptyMessage() }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alerts {
      animation: fadeIn 0.3s ease-in;
      max-width: 1200px;
      margin: 0 auto;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    h2 {
      color: #2d3748;
      margin-bottom: 1.5rem;
      font-size: 1.8rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stats-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-item {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
      border-top: 4px solid #667eea;
    }

    .stat-number {
      display: block;
      font-size: 2.5rem;
      font-weight: bold;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #718096;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .filter-group {
      display: flex;
      gap: 1rem;
    }

    .filter-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      color: #4a5568;
    }

    .filter-group select {
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: white;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      background: #f7fafc;
      padding: 0.75rem 1rem;
      border-radius: 6px;
    }

    .page-info {
      color: #4a5568;
      font-size: 0.9rem;
    }

    .pager {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-nav {
      background: white;
      border: 1px solid #e2e8f0;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-nav:hover:not(:disabled) {
      background: #f7fafc;
      transform: translateY(-1px);
    }

    .btn-nav:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-current {
      font-weight: 500;
      color: #4a5568;
      min-width: 100px;
      text-align: center;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .item {
      display: flex;
      align-items: center;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-left: 4px solid #667eea;
      transition: all 0.2s;
    }

    .item:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-1px);
    }

    .item.resolved {
      opacity: 0.7;
      border-left-color: #38a169;
    }

    .item.critical {
      border-left-color: #e53e3e;
    }

    .item.warning {
      border-left-color: #ed8936;
    }

    .status-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 1rem;
      gap: 0.25rem;
    }

    .severity-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #e2e8f0;
    }

    .severity-dot.critical {
      background: #e53e3e;
      animation: pulse 2s infinite;
    }

    .severity-dot.warning {
      background: #ed8936;
    }

    .severity-dot.info {
      background: #3182ce;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .resolution-status {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .resolution-status.resolved {
      color: #38a169;
    }

    .meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .alert-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .alert-type {
      font-weight: 600;
      color: #2d3748;
      font-size: 1.1rem;
    }

    .severity-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .severity-badge.critical {
      background: #fed7d7;
      color: #c53030;
    }

    .severity-badge.warning {
      background: #feebc8;
      color: #c05621;
    }

    .severity-badge.info {
      background: #bee3f8;
      color: #2a69ac;
    }

    .message {
      color: #4a5568;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .timestamp {
      color: #a0aec0;
      font-size: 0.85rem;
    }

    .actions {
      margin-left: 1rem;
    }

    .btn-resolve {
      background: #38a169;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-resolve:hover:not(:disabled) {
      background: #2f855a;
      transform: scale(1.05);
    }

    .btn-resolve:disabled {
      background: #a0aec0;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .resolved-text {
      color: #38a169;
      font-size: 0.85rem;
      font-style: italic;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h4 {
      color: #2d3748;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      color: #718096;
      margin: 0;
    }
  `]
})
export class AlertsComponent implements OnInit {
  alerts: any[] = [];
  filteredAlerts: any[] = [];
  pagedAlerts: any[] = [];
  pageSize: number = 10;
  page: number = 0;
  statusFilter: string = 'all';
  severityFilter: string = 'all';

  constructor(private api: ApiService) {}

  ngOnInit() { this.refresh(); }

  get unresolvedCount(): number {
    return this.alerts.filter(a => !a.is_resolved).length;
  }

  get resolvedCount(): number {
    return this.alerts.filter(a => a.is_resolved).length;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAlerts.length / this.pageSize) || 1;
  }

  refresh() {
    this.api.getAlerts().subscribe({
      next: (r) => {
        this.alerts = r.data || [];
        this.applyFilters();
      },
      error: () => {
        this.alerts = [];
        this.applyFilters();
      }
    });
  }

  resolve(id: string) {
    this.api.resolveAlert(id).subscribe({
      next: () => this.refresh(),
      error: (err) => console.error('Failed to resolve alert:', err)
    });
  }

  applyFilters() {
    let filtered = [...this.alerts];

    // Status filter
    if (this.statusFilter === 'unresolved') {
      filtered = filtered.filter(a => !a.is_resolved);
    } else if (this.statusFilter === 'resolved') {
      filtered = filtered.filter(a => a.is_resolved);
    }

    // Severity filter
    if (this.severityFilter !== 'all') {
      filtered = filtered.filter(a => a.severity === this.severityFilter);
    }

    this.filteredAlerts = filtered;
    this.page = 0; // Reset to first page when filtering
    this.applyPagination();
  }

  applyPagination() {
    const start = this.page * this.pageSize;
    this.pagedAlerts = this.filteredAlerts.slice(start, start + this.pageSize);
  }

  prev() {
    if (this.page > 0) {
      this.page--;
      this.applyPagination();
    }
  }

  next() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.applyPagination();
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  }

  getEmptyMessage(): string {
    if (this.alerts.length === 0) {
      return "No alerts have been generated yet. All your monitors are running smoothly!";
    }

    if (this.statusFilter === 'unresolved') {
      return "No unresolved alerts found. All issues have been resolved!";
    }

    if (this.statusFilter === 'resolved') {
      return "No resolved alerts found.";
    }

    return `No alerts match the current filters (${this.statusFilter} status, ${this.severityFilter} severity).`;
  }

  trackByAlertId(index: number, alert: any): string {
    return alert.id;
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }
}