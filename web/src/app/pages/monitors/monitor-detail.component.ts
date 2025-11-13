import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-monitor-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NgChartsModule, FormsModule],
  template: `
    <div class="monitor-detail">
      <a routerLink="/monitors" class="back">← Back to Monitors</a>
      <h2>{{ monitor?.name || 'Monitor' }}</h2>
      <p class="url">{{ monitor?.method }} {{ monitor?.url }}</p>

      <div class="actions">
        <button (click)="refresh()">Refresh Metrics</button>
        <button (click)="manualCheck()">Run Manual Check</button>
      </div>

      <div class="filters">
        <label>
          Summary Days
          <select [(ngModel)]="summaryDays" (change)="load()">
            <option [value]="7">7</option>
            <option [value]="14">14</option>
            <option [value]="30">30</option>
          </select>
        </label>
        <label>
          Uptime Days
          <select [(ngModel)]="uptimeDays" (change)="load()">
            <option [value]="7">7</option>
            <option [value]="14">14</option>
            <option [value]="30">30</option>
          </select>
        </label>
      </div>

      <div class="cards">
        <div class="card">
          <h3>Expected Status</h3>
          <p class="value">{{ monitor?.expected_status_code }}</p>
        </div>
        <div class="card">
          <h3>Active</h3>
          <p class="value" [class.ok]="monitor?.is_active">{{ monitor?.is_active ? 'Yes' : 'No' }}</p>
        </div>
        <div class="card" *ngIf="summary">
          <h3>Uptime ({{ summary.days }}d)</h3>
          <p class="value ok">{{ summary.uptime_percentage }}%</p>
        </div>
        <div class="card" *ngIf="summary">
          <h3>Avg Response</h3>
          <p class="value">{{ summary.average_response_time || 0 }} ms</p>
        </div>
      </div>

      <div class="chart-wrap" *ngIf="lineChartData.labels?.length">
        <h3>Response Time (ms)</h3>
        <canvas baseChart
          [data]="lineChartData"
          [options]="lineChartOptions"
          [type]="'line'">
        </canvas>
      </div>

      <div class="chart-wrap" *ngIf="uptimeChartData.labels?.length">
        <h3>Daily Uptime (%)</h3>
        <canvas baseChart
          [data]="uptimeChartData"
          [options]="uptimeChartOptions"
          [type]="'line'">
        </canvas>
      </div>

      <div class="table" *ngIf="metrics.length">
        <h3>Recent Checks</h3>
        <div class="pager">
          <label>
            Page Size
            <select [(ngModel)]="pageSize" (change)="applyMetricsPagination()">
              <option [value]="10">10</option>
              <option [value]="20">20</option>
              <option [value]="50">50</option>
            </select>
          </label>
          <button (click)="prev()" [disabled]="page===0">Prev</button>
          <span>{{ page+1 }}</span>
          <button (click)="next()" [disabled]="(page+1)*pageSize >= metrics.length">Next</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Checked At</th>
              <th>Status</th>
              <th>Resp. Time (ms)</th>
              <th>Success</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of displayMetrics">
              <td>{{ m.checked_at }}</td>
              <td>{{ m.status_code }}</td>
              <td>{{ m.response_time }}</td>
              <td [class.ok]="m.is_success">{{ m.is_success ? '✔' : '✖' }}</td>
              <td>{{ m.error_message || '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .monitor-detail { animation: fadeIn .2s ease-in; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .back { text-decoration:none; color:#667eea; display:inline-block; margin-bottom:.5rem; }
    .url { color:#718096; margin-top:0; }
    .actions { display:flex; gap:.5rem; margin:1rem 0; }
    .actions button { padding:.5rem .75rem; border:1px solid #cbd5e0; background:#fff; border-radius:4px; }
    .cards { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin:1rem 0; }
    .card { background:#fff; padding:1rem; border-radius:8px; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    .card h3 { margin:0 0 .5rem 0; color:#4a5568; text-transform:uppercase; font-size:.8rem; letter-spacing:1px; }
    .value { font-size:1.3rem; font-weight:700; color:#e53e3e; }
    .value.ok { color:#38a169; }
    .chart-wrap { background:#fff; padding:1rem; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,.1); }
    .table { background:#fff; padding:1rem; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,.1); margin-top:1rem; }
    table { width:100%; border-collapse:collapse; }
    th, td { text-align:left; padding:.5rem; border-bottom:1px solid #edf2f7; }
    td.ok { color:#38a169; font-weight:700; }
  `]
})
export class MonitorDetailComponent implements OnInit {
  monitor: any | null = null;
  metrics: any[] = [];
  displayMetrics: any[] = [];
  id = '';
  summary: any | null = null;
  summaryDays: number = 7;
  uptimeDays: number = 30;
  pageSize: number = 20;
  page: number = 0;

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Response Time', fill: false, borderColor: '#667eea' }]
  };
  lineChartOptions: ChartOptions<'line'> = { responsive: true, plugins: { legend: { display: true } } };
  uptimeChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [{ data: [], label: 'Uptime %', fill: true, borderColor: '#38a169', backgroundColor: 'rgba(56,161,105,0.2)' }] };
  uptimeChartOptions: ChartOptions<'line'> = { responsive: true, scales: { y: { suggestedMin: 0, suggestedMax: 100 } } };

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.load();
  }

  load() {
    this.api.getMonitor(this.id).subscribe({ next: (m) => this.monitor = m });
    this.api.getMonitorMetrics(this.id).subscribe({ next: (r) => {
      this.metrics = r.data || [];
      const labels = this.metrics.map(x => x.checked_at);
      const data = this.metrics.map(x => x.response_time);
      this.lineChartData = { labels, datasets: [{ data, label: 'Response Time', fill: false, borderColor: '#667eea' }] };
      this.page = 0; this.applyMetricsPagination();
    }});
    this.api.getMonitorMetricsSummary(this.id, this.summaryDays).subscribe({ next: (s) => this.summary = s });
    this.api.getMonitorUptimeDaily(this.id, this.uptimeDays).subscribe({ next: (r: any) => {
      const labels = (r.data || []).map((x: any) => x.date);
      const data = (r.data || []).map((x: any) => x.uptime_percentage);
      this.uptimeChartData = { labels, datasets: [{ data, label: 'Uptime %', fill: true, borderColor: '#38a169', backgroundColor: 'rgba(56,161,105,0.2)' }] };
    }});
  }

  refresh() { this.load(); }

  manualCheck() {
    this.api.checkMonitor(this.id).subscribe({ next: () => this.load() });
  }

  applyMetricsPagination() {
    const start = this.page * this.pageSize;
    this.displayMetrics = this.metrics.slice(start, start + this.pageSize);
  }
  prev() { if (this.page > 0) { this.page--; this.applyMetricsPagination(); } }
  next() { if ((this.page + 1) * this.pageSize < this.metrics.length) { this.page++; this.applyMetricsPagination(); } }
}
//
