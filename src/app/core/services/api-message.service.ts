import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

const SUCCESS_LIFE_MS = 4000;
const ERROR_LIFE_MS = 6000;
const DEDUPE_WINDOW_MS = 1500;

/**
 * Global messaging service wrapping PrimeNG MessageService for API results.
 * Enforces toast deduplication and duration conventions (SEC-18 compliant text rendering).
 */
@Injectable({ providedIn: 'root' })
export class ApiMessageService {
  private readonly messageService = inject(MessageService);
  private last = { key: '', at: 0 };

  /**
   * Displays an automatic success toast message.
   * @param detail The textual success detail to display.
   */
  success(detail: string): void {
    this.show('success', 'Success', detail, SUCCESS_LIFE_MS);
  }

  /**
   * Displays an automatic error toast message.
   * @param detail The error detail string.
   * @param summary Optional error summary header.
   */
  error(detail: string, summary = 'Error'): void {
    this.show('error', summary, detail, ERROR_LIFE_MS);
  }

  private show(severity: 'success' | 'error', summary: string, detail: string, life: number): void {
    const key = `${severity}|${detail}`;
    const now = Date.now();
    if (key === this.last.key && now - this.last.at < DEDUPE_WINDOW_MS) {
      return;
    }
    this.last = { key, at: now };
    this.messageService.add({ severity, summary, detail, life });
  }
}
