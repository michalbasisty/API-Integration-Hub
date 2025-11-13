import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotifyService, ToastMessage } from '../../services/notify.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let t of toasts" class="toast" [class.success]="t.type==='success'" [class.error]="t.type==='error'" [class.info]="t.type==='info'">
        {{ t.text }}
      </div>
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; bottom: 20px; right: 20px; display:flex; flex-direction:column; gap:.5rem; z-index: 1000; }
    .toast { padding:.6rem .9rem; border-radius:6px; color:#fff; box-shadow:0 2px 8px rgba(0,0,0,.2); }
    .toast.success { background:#38a169; }
    .toast.error { background:#e53e3e; }
    .toast.info { background:#3182ce; }
  `]
})
export class ToastComponent {
  toasts: ToastMessage[] = [];

  constructor(private notify: NotifyService) {
    this.notify.messages$.subscribe(m => {
      this.toasts = [...this.toasts, m];
      setTimeout(() => { this.toasts = this.toasts.slice(1); }, 3000);
    });
  }
}