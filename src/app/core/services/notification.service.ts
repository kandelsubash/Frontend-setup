import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * High-level notification service wrapping PrimeNG MessageService for non-API UI toasts
 * (e.g., "Copied to clipboard", user prompt notices, client-side validation warnings).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messageService = inject(MessageService);

  /**
   * Shows an informational toast.
   * @param detail Message text.
   * @param summary Optional header.
   */
  info(detail: string, summary = 'Information'): void {
    this.messageService.add({ severity: 'info', summary, detail, life: 3000 });
  }

  /**
   * Shows a warning toast.
   * @param detail Warning text.
   * @param summary Optional header.
   */
  warn(detail: string, summary = 'Warning'): void {
    this.messageService.add({ severity: 'warn', summary, detail, life: 5000 });
  }

  /**
   * Shows a success toast.
   * @param detail Success message.
   * @param summary Optional header.
   */
  success(detail: string, summary = 'Success'): void {
    this.messageService.add({ severity: 'success', summary, detail, life: 4000 });
  }

  /**
   * Shows an error toast.
   * @param detail Error message.
   * @param summary Optional header.
   */
  error(detail: string, summary = 'Error'): void {
    this.messageService.add({ severity: 'error', summary, detail, life: 6000 });
  }

  /**
   * Clears all active toast notifications.
   */
  clear(): void {
    this.messageService.clear();
  }
}
