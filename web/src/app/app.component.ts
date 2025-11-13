import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { User } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <div class="app-container">
      <header class="navbar" *ngIf="showNavigation">
        <div class="navbar-brand">
          <h1>🚀 PulseAPI</h1>
          <p>API Performance Monitor</p>
        </div>
        <nav class="navbar-nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Dashboard</span>
          </a>
          <a routerLink="/status" routerLinkActive="active" class="nav-link">
            <span class="nav-icon">⚡</span>
            <span class="nav-text">System Status</span>
          </a>
          <a routerLink="/monitors" routerLinkActive="active" class="nav-link">
            <span class="nav-icon">👁️</span>
            <span class="nav-text">Monitors</span>
          </a>
          <a routerLink="/alerts" routerLinkActive="active" class="nav-link">
            <span class="nav-icon">🚨</span>
            <span class="nav-text">Alerts</span>
          </a>
        </nav>
        <div class="navbar-actions">
          <div class="user-info" *ngIf="currentUser">
            <span class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
            <button class="action-btn logout-btn" title="Logout" (click)="logout()">🚪</button>
          </div>
          <button class="action-btn" title="Settings">⚙️</button>
          <button class="action-btn" title="Help">❓</button>
        </div>
      </header>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <footer class="footer" *ngIf="showNavigation">
        <p>&copy; 2025 PulseAPI - AI-Powered API Monitor</p>
      </footer>
      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f7fa;
    }

    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .navbar-brand h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .navbar-brand p {
      margin: 0;
      opacity: 0.9;
      font-size: 0.85rem;
    }

    .navbar-nav {
      display: flex;
      gap: 0.5rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s;
      position: relative;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-link.active {
      background: rgba(255, 255, 255, 0.15);
      color: white;
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: #ffd700;
      border-radius: 1px;
    }

    .nav-icon {
      font-size: 1.1rem;
    }

    .nav-text {
      font-size: 0.9rem;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .footer {
      background: #2d3748;
      color: #cbd5e0;
      padding: 1.5rem;
      text-align: center;
      border-top: 1px solid #4a5568;
    }

    .navbar-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-right: 0.5rem;
    }

    .user-name {
      color: white;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .action-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      padding: 0.5rem;
      border-radius: 6px;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1rem;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }

    .logout-btn {
      background: rgba(255, 255, 255, 0.15);
    }

    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      color: #ff6b6b;
    }

    .footer p {
      margin: 0;
    }

    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        gap: 1rem;
      }

      .navbar-brand {
        text-align: center;
      }

      .navbar-nav {
        justify-content: center;
        flex-wrap: wrap;
      }

      .nav-link {
        padding: 0.5rem 0.75rem;
        font-size: 0.85rem;
      }

      .nav-text {
        display: none;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'PulseAPI';
  currentUser: User | null = null;
  showNavigation = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.showNavigation = this.authService.isAuthenticated;
    });
  }

  logout(): void {
    this.authService.logout();
    // Navigation will be handled by the auth guard when user state changes
  }
}
