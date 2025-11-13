import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { StatusComponent } from './pages/status/status.component';
import { MonitorsComponent } from './pages/monitors/monitors.component';
import { MonitorDetailComponent } from './pages/monitors/monitor-detail.component';
import { AlertsComponent } from './pages/alerts/alerts.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected routes
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'status', component: StatusComponent, canActivate: [AuthGuard] },
  { path: 'monitors', component: MonitorsComponent, canActivate: [AuthGuard] },
  { path: 'monitors/:id', component: MonitorDetailComponent, canActivate: [AuthGuard] },
  { path: 'alerts', component: AlertsComponent, canActivate: [AuthGuard] },

  // Redirect unknown routes to dashboard
  { path: '**', redirectTo: '' }
];
