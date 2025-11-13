import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { StatusComponent } from './pages/status/status.component';
import { MonitorsComponent } from './pages/monitors/monitors.component';
import { MonitorDetailComponent } from './pages/monitors/monitor-detail.component';
import { AlertsComponent } from './pages/alerts/alerts.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'status', component: StatusComponent },
  { path: 'monitors', component: MonitorsComponent },
  { path: 'monitors/:id', component: MonitorDetailComponent },
  { path: 'alerts', component: AlertsComponent },
  { path: '**', redirectTo: '' }
];
