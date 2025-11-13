import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-monitors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="monitors">
      <h2>Monitors</h2>
      <div class="tools">
        <input [(ngModel)]="search" (input)="applyFilters()" placeholder="Search by name or URL" />
        <select [(ngModel)]="sort" (change)="applyFilters()">
          <option value="name">Sort by Name</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      <form class="monitor-form" (ngSubmit)="create()">
        <input [(ngModel)]="form.name" name="name" placeholder="Name" required />
        <input [(ngModel)]="form.url" name="url" placeholder="URL" required />
        <select [(ngModel)]="form.method" name="method">
          <option>GET</option>
          <option>POST</option>
        </select>
        <input [(ngModel)]="form.expected_status_code" name="expected_status_code" type="number" placeholder="Expected Status" />
        <button type="submit">Create</button>
      </form>

      <div class="list">
        <div class="item" *ngFor="let m of filteredMonitors; trackBy: trackByMonitorId">
          <div class="status-indicator">
            <div class="status-dot" [class.up]="getStatus(m)" [class.down]="!getStatus(m)" [class.unknown]="true"></div>
          </div>
          <div class="meta">
            <div class="name"><a [routerLink]="['/monitors', m.id]">{{ m.name }}</a></div>
            <div class="url">{{ m.url }}</div>
            <div class="details">
              <span class="method">{{ m.method }}</span>
              <span class="response-time" *ngIf="m.lastCheck">Last: {{ m.lastCheck.response_time }}ms</span>
              <span class="uptime" *ngIf="m.uptime">Uptime: {{ m.uptime }}%</span>
            </div>
          </div>
          <div class="actions">
            <button class="btn-check" (click)="check(m.id)" [disabled]="checking[m.id]">
              <span *ngIf="!checking[m.id]">🔍 Check</span>
              <span *ngIf="checking[m.id]">⏳ Checking...</span>
            </button>
            <button class="btn-toggle" (click)="toggle(m)" [class.active]="m.is_active">
              {{ m.is_active ? '✅ Active' : '⏸️ Inactive' }}
            </button>
            <button class="btn-edit" (click)="edit(m)">✏️ Edit</button>
            <button class="btn-delete" (click)="remove(m.id)">🗑️ Delete</button>
          </div>
        </div>
        <div *ngIf="filteredMonitors.length === 0" class="empty-state">
          <div class="empty-icon">👁️</div>
          <h4>No Monitors Yet</h4>
          <p>Create your first API monitor to start monitoring endpoints!</p>
        </div>
      </div>
      <div class="edit-panel" *ngIf="editing">
        <h3>Edit Monitor</h3>
        <form (ngSubmit)="save()" class="edit-form">
          <input [(ngModel)]="editForm.name" name="edit_name" placeholder="Name" />
          <input [(ngModel)]="editForm.url" name="edit_url" placeholder="URL" />
          <select [(ngModel)]="editForm.method" name="edit_method">
            <option>GET</option>
            <option>POST</option>
          </select>
          <input [(ngModel)]="editForm.expected_status_code" name="edit_expected_status_code" type="number" placeholder="Expected Status" />
          <label class="toggle">
            <input type="checkbox" [(ngModel)]="editForm.is_active" name="edit_is_active" /> Active
          </label>
          <button type="submit">Save</button>
          <button type="button" (click)="cancel()">Cancel</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .monitors { animation: fadeIn 0.2s ease-in; }
    @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
    h2 { color: #2d3748; margin-bottom: 1rem; }
    .monitor-form { display:flex; gap:.5rem; margin-bottom:1rem; }
    .monitor-form input, .monitor-form select { padding:.5rem; border:1px solid #e2e8f0; border-radius:4px; }
    .monitor-form button { padding:.5rem .75rem; background:#667eea; color:#fff; border:none; border-radius:4px; }
    .list { display:flex; flex-direction:column; gap:.75rem; }
    .item { display:flex; align-items:center; padding:1rem; background:#fff; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); border-left:4px solid #667eea; transition:all 0.2s; }
    .item:hover { box-shadow:0 4px 12px rgba(0,0,0,0.15); transform:translateY(-1px); }

    .status-indicator { margin-right:1rem; }
    .status-dot { width:12px; height:12px; border-radius:50%; background:#e2e8f0; }
    .status-dot.up { background:#38a169; }
    .status-dot.down { background:#e53e3e; }
    .status-dot.unknown { background:#fbb6ce; animation:pulse 2s infinite; }

    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

    .meta { flex:1; display:flex; flex-direction:column; gap:.25rem; }
    .name { font-weight:600; color:#2d3748; font-size:1.1rem; }
    .name a { color:inherit; text-decoration:none; }
    .name a:hover { color:#667eea; }
    .url { color:#718096; font-size:.9rem; }
    .details { display:flex; gap:1rem; align-items:center; margin-top:.25rem; }
    .method { background:#edf2f7; color:#4a5568; padding:.2rem .5rem; border-radius:12px; font-size:.75rem; font-weight:500; text-transform:uppercase; }
    .response-time { color:#38a169; font-size:.85rem; font-weight:500; }
    .uptime { color:#3182ce; font-size:.85rem; font-weight:500; }

    .actions { display:flex; gap:.5rem; }
    .actions button { padding:.5rem .75rem; border:none; border-radius:6px; font-size:.85rem; font-weight:500; cursor:pointer; transition:all 0.2s; }
    .btn-check { background:#38a169; color:white; }
    .btn-check:hover:not(:disabled) { background:#2f855a; transform:scale(1.05); }
    .btn-check:disabled { background:#a0aec0; cursor:not-allowed; opacity:0.7; }
    .btn-toggle { background:#667eea; color:white; }
    .btn-toggle:hover { background:#5a67d8; transform:scale(1.05); }
    .btn-toggle.active { background:#38a169; }
    .btn-edit { background:#ed8936; color:white; }
    .btn-edit:hover { background:#dd6b20; transform:scale(1.05); }
    .btn-delete { background:#e53e3e; color:white; }
    .btn-delete:hover { background:#c53030; transform:scale(1.05); }

    .empty-state { text-align:center; padding:3rem 2rem; background:white; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); }
    .empty-icon { font-size:3rem; margin-bottom:1rem; }
    .empty-state h4 { color:#2d3748; margin:0 0 .5rem 0; }
    .empty-state p { color:#718096; margin:0; }
  `]
})
export class MonitorsComponent implements OnInit {
  monitors: any[] = [];
  filteredMonitors: any[] = [];
  form: any = { name: '', url: '', method: 'GET', expected_status_code: 200 };
  search: string = '';
  sort: 'name' | 'status' = 'name';
  editing: boolean = false;
  editId: string = '';
  editForm: any = { name: '', url: '', method: 'GET', expected_status_code: 200, is_active: true };
  checking: { [key: string]: boolean } = {};

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getMonitors().subscribe({
      next: (r) => { this.monitors = r.data || []; this.applyFilters(); },
      error: () => { this.monitors = []; this.applyFilters(); }
    });
  }

  create() {
    this.api.createMonitor(this.form).subscribe({
      next: () => { this.form = { name: '', url: '', method: 'GET', expected_status_code: 200 }; this.load(); },
    });
  }

  remove(id: string) {
    this.api.deleteMonitor(id).subscribe({ next: () => this.load() });
  }

  check(id: string) {
    this.checking[id] = true;
    this.api.checkMonitor(id).subscribe({
      next: (result) => {
        // Update the monitor with latest check result
        const monitor = this.monitors.find(m => m.id === id);
        if (monitor) {
          monitor.lastCheck = result;
          monitor.status = result.is_success ? 'up' : 'down';
        }
        this.checking[id] = false;
      },
      error: () => {
        this.checking[id] = false;
      }
    });
  }

  getStatus(monitor: any): boolean {
    // For now, assume active monitors are up - in a real app you'd check recent metrics
    return monitor.is_active && monitor.lastCheck?.is_success !== false;
  }

  trackByMonitorId(index: number, monitor: any): string {
    return monitor.id;
  }

  applyFilters() {
    const s = (this.search || '').toLowerCase();
    let arr = [...this.monitors].filter(m => (
      (m.name || '').toLowerCase().includes(s) || (m.url || '').toLowerCase().includes(s)
    ));
    if (this.sort === 'name') {
      arr.sort((a,b) => (a.name || '').localeCompare(b.name || ''));
    } else {
      arr.sort((a,b) => Number(b.is_active) - Number(a.is_active));
    }
    this.filteredMonitors = arr;
  }

  toggle(m: any) {
    this.api.updateMonitor(m.id, { is_active: !m.is_active }).subscribe({ next: () => this.load() });
  }

  edit(m: any) {
    this.editing = true;
    this.editId = m.id;
    this.editForm = { name: m.name, url: m.url, method: m.method, expected_status_code: m.expected_status_code, is_active: m.is_active };
  }

  save() {
    this.api.updateMonitor(this.editId, this.editForm).subscribe({ next: () => { this.editing = false; this.editId = ''; this.load(); } });
  }

  cancel() {
    this.editing = false;
    this.editId = '';
  }
}
