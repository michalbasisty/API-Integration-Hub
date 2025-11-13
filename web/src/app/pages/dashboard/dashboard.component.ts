import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <h2>Dashboard</h2>
      
      <div class="status-cards">
        <div class="card" [class.loading]="loading">
          <h3>Backend API</h3>
          <p class="status" [class.ok]="backendStatus === 'ok'">
            {{ backendStatus || 'Loading...' }}
          </p>
        </div>
        
        <div class="card" [class.loading]="loading">
          <h3>Database</h3>
          <p class="status" [class.ok]="dbStatus === 'connected'">
            {{ dbStatus || 'Loading...' }}
          </p>
        </div>
        
        <div class="card" [class.loading]="loading">
          <h3>Redis Cache</h3>
          <p class="status" [class.ok]="redisStatus === 'connected'">
            {{ redisStatus || 'Loading...' }}
          </p>
        </div>
      </div>

      <div class="stats-section">
        <h3>Monitor Statistics</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ monitorStats.total }}</div>
            <div class="stat-label">Total Monitors</div>
          </div>
          <div class="stat-card">
            <div class="stat-number up">{{ monitorStats.up }}</div>
            <div class="stat-label">Up & Running</div>
          </div>
          <div class="stat-card">
            <div class="stat-number down">{{ monitorStats.down }}</div>
            <div class="stat-label">Down</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ monitorStats.avgResponseTime }}ms</div>
            <div class="stat-label">Avg Response Time</div>
          </div>
        </div>
      </div>

      <div class="projects-section">
        <h3>Projects <span class="count">({{ projects.length }})</span></h3>
        <div class="projects-list">
          <div *ngFor="let project of projects" class="project-item">
            <div class="project-info">
              <span class="project-name">{{ project.name }}</span>
              <span class="project-url">{{ project.url }}</span>
            </div>
            <span class="project-status" [class.active]="project.status === 'active'">{{ project.status }}</span>
          </div>
          <div *ngIf="projects.length === 0" class="empty-state">
            <div class="empty-icon">📊</div>
            <h4>No Monitors Yet</h4>
            <p>Create your first API monitor to start monitoring performance!</p>
            <a routerLink="/monitors" class="create-btn">Create Monitor</a>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <a routerLink="/monitors" class="action-card">
            <div class="action-icon">➕</div>
            <div class="action-text">Add Monitor</div>
          </a>
          <button class="action-card" (click)="runAllChecks()">
            <div class="action-icon">🔄</div>
            <div class="action-text">Run All Checks</div>
          </button>
          <a routerLink="/status" class="action-card">
            <div class="action-icon">⚡</div>
            <div class="action-text">System Status</div>
          </a>
          <a routerLink="/alerts" class="action-card">
            <div class="action-icon">🚨</div>
            <div class="action-text">View Alerts</div>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    h2 {
      color: #2d3748;
      margin-bottom: 2rem;
    }

    .status-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }

    .card:hover:not(.loading) {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    .card.loading {
      opacity: 0.6;
    }

    .card h3 {
      margin: 0 0 1rem 0;
      color: #4a5568;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .status {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0;
      color: #e53e3e;
    }

    .status.ok {
      color: #38a169;
    }

    .projects-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .stats-section {
      margin-bottom: 2rem;
    }

    .stats-section h3 {
      margin-bottom: 1.5rem;
      color: #2d3748;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center;
      border-top: 3px solid #667eea;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }

    .stat-number.up {
      color: #38a169;
    }

    .stat-number.down {
      color: #e53e3e;
    }

    .stat-label {
      color: #718096;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .projects-section h3 {
      margin-top: 0;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .count {
      background: #667eea;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .projects-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .project-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 6px;
      border-left: 3px solid #667eea;
      transition: all 0.2s;
    }

    .project-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transform: translateY(-1px);
    }

    .project-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .project-name {
      font-weight: 500;
      color: #2d3748;
    }

    .project-url {
      color: #718096;
      font-size: 0.85rem;
    }

    .project-status {
      background: #c6f6d5;
      color: #22543d;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .project-status.active {
      background: #bee3f8;
      color: #2a69ac;
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
      margin: 0 0 1.5rem 0;
    }

    .create-btn {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .create-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .quick-actions {
      margin-top: 2rem;
    }

    .quick-actions h3 {
      margin-bottom: 1.5rem;
      color: #2d3748;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-decoration: none;
      color: #2d3748;
      transition: all 0.2s;
      cursor: pointer;
      border: 1px solid transparent;
    }

    .action-card:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-color: #667eea;
    }

    .action-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .action-text {
      font-weight: 500;
      text-align: center;
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  backendStatus: string | null = null;
  dbStatus: string | null = null;
  redisStatus: string | null = null;
  projects: any[] = [];
  monitorStats = { total: 0, up: 0, down: 0, avgResponseTime: 0 };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadStatus();
    this.loadProjects();
  }

  loadStatus() {
    this.apiService.getBackendStatus().subscribe({
      next: (response) => {
        this.backendStatus = 'ok';
        this.dbStatus = response.database || 'unknown';
        this.redisStatus = response.redis || 'unknown';
        this.loading = false;
      },
      error: () => {
        this.backendStatus = 'error';
        this.loading = false;
      }
    });
  }

  loadProjects() {
    this.apiService.getProjects().subscribe({
      next: (response) => {
        this.projects = response.data || [];
        this.calculateStats();
      },
      error: () => {
        this.projects = [];
        this.calculateStats();
      }
    });
  }

  calculateStats() {
    this.monitorStats.total = this.projects.length;
    // For now, we'll simulate some stats - in a real app, you'd get this from the API
    this.monitorStats.up = Math.floor(this.projects.length * 0.8); // 80% up
    this.monitorStats.down = this.projects.length - this.monitorStats.up;
    this.monitorStats.avgResponseTime = Math.floor(Math.random() * 200) + 50; // Random 50-250ms
  }

  runAllChecks() {
    // In a real app, you'd call an API to run all checks
    alert('Running health checks for all monitors... (Feature coming soon)');
  }
}
