import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  template: `
    @if (toastService.isVisible()) {
      <div class="toast-container">
        {{ toastService.message() }}
      </div>
    }
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #333;
      color: #fff;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
