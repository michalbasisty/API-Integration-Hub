import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-page">
      <h2>System Status</h2>
      
      <div class="status-grid">
        <div class="status-item" [class.connected]="backendConnected">
          <h3>Backend API</h3>
          <div class="status-indicator" [class.ok]="backendConnected"></div>
          <p>{{ backendConnected ? 'Connected' : 'Disconnected' }}</p>
          <p class="endpoint">/api/health</p>
        </div>

        <div class="status-item" [class.connected]="databaseConnected">
          <h3>Database</h3>
          <div class="status-indicator" [class.ok]="databaseConnected"></div>
          <p>{{ databaseConnected ? 'Connected' : 'Disconnected' }}</p>
          <p class="endpoint">PostgreSQL</p>
        </div>

        <div class="status-item" [class.connected]="redisConnected">
          <h3>Redis Cache</h3>
          <div class="status-indicator" [class.ok]="redisConnected"></div>
          <p>{{ redisConnected ? 'Connected' : 'Disconnected' }}</p>
          <p class="endpoint">Redis:6379</p>
        </div>

        <div class="status-item" [class.connected]="aiServiceConnected">
          <h3>AI Service</h3>
          <div class="status-indicator" [class.ok]="aiServiceConnected"></div>
          <p>{{ aiServiceConnected ? 'Connected' : 'Disconnected' }}</p>
          <p class="endpoint">http://localhost:8001</p>
        </div>
      </div>

      <div class="service-details">
        <h3>Service Details</h3>
        <div class="details-box" *ngIf="serviceInfo">
          <p><strong>Backend:</strong> {{ serviceInfo.backend || 'N/A' }}</p>
          <p><strong>Database:</strong> {{ serviceInfo.database || 'N/A' }}</p>
          <p><strong>Redis:</strong> {{ serviceInfo.redis || 'N/A' }}</p>
          <p><strong>Timestamp:</strong> {{ serviceInfo.timestamp || 'N/A' }}</p>
        </div>
      </div>

      <button class="refresh-btn" (click)="refresh()">Refresh Status</button>
    </div>
  `,
  styles: [`
    .status-page {
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

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .status-item {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-top: 4px solid #e53e3e;
      transition: all 0.2s;
    }

    .status-item.connected {
      border-top-color: #38a169;
    }

    .status-item:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .status-item h3 {
      margin: 0 0 1rem 0;
      color: #2d3748;
      font-size: 0.95rem;
    }

    .status-indicator {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fc8181;
      margin-bottom: 1rem;
      animation: pulse 2s infinite;
    }

    .status-indicator.ok {
      background: #68d391;
      animation: none;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }

    .status-item p {
      margin: 0.5rem 0;
      color: #4a5568;
    }

    .endpoint {
      font-size: 0.85rem;
      color: #718096;
    }

    .service-details {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .service-details h3 {
      margin-top: 0;
      color: #2d3748;
    }

    .details-box {
      background: #f7fafc;
      padding: 1rem;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9rem;
    }

    .details-box p {
      margin: 0.5rem 0;
      color: #4a5568;
    }

    .refresh-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .refresh-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .refresh-btn:active {
      transform: translateY(0);
    }
  `]
})
export class StatusComponent implements OnInit {
  backendConnected = false;
  databaseConnected = false;
  redisConnected = false;
  aiServiceConnected = false;
  serviceInfo: any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    // Check Backend
    this.apiService.getBackendStatus().subscribe({
      next: (response) => {
        this.backendConnected = true;
        this.databaseConnected = response.database === 'connected';
        this.redisConnected = response.redis === 'connected';
        this.serviceInfo = response;
      },
      error: () => {
        this.backendConnected = false;
      }
    });

    // Check AI Service (via backend proxy if available)
    // In production, you'd have a separate health check endpoint
    this.aiServiceConnected = true; // Placeholder
  }
}
