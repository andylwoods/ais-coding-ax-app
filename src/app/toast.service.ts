import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  message = signal<string | null>(null);
  isVisible = signal(false);

  show(message: string) {
    this.message.set(message);
    this.isVisible.set(true);
    setTimeout(() => this.hide(), 3000);
  }

  hide() {
    this.isVisible.set(false);
  }
}
