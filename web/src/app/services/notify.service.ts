import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastMessage = { type: 'success' | 'error' | 'info', text: string };

@Injectable({ providedIn: 'root' })
export class NotifyService {
  private stream = new Subject<ToastMessage>();
  messages$ = this.stream.asObservable();

  success(text: string) { this.stream.next({ type: 'success', text }); }
  error(text: string) { this.stream.next({ type: 'error', text }); }
  info(text: string) { this.stream.next({ type: 'info', text }); }
}