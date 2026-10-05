import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ApiMessageService } from './api-message.service';

/**
 * Global Angular ErrorHandler.
 * Catches unhandled client exceptions and handles logging without exposing stack traces in production.
 */
@Injectable({ providedIn: 'root' })
export class GlobalErrorHandlerService implements ErrorHandler {
  private readonly messageService = inject(ApiMessageService);

  /**
   * Handles uncaught exceptions across the Angular application.
   * @param error Uncaught exception or rejection.
   */
  handleError(error: unknown): void {
    const rawMessage = error instanceof Error ? error.message : String(error ?? '');

    // Safe error logging for developers
    if (typeof console !== 'undefined' && console.error) {
      console.error('[Application Error]:', error);
    }

    // Suppress raw browser fetch failures, abort errors, or cancelled navigations from popping up toasts.
    // API errors are handled cleanly and uniformly by apiResponseInterceptor.
    if (
      !rawMessage ||
      rawMessage.toLowerCase().includes('fetch') ||
      rawMessage.includes('AbortError') ||
      rawMessage.includes('NavigationCancelled')
    ) {
      return;
    }

    this.messageService.error(rawMessage, 'Application Error');
  }
}
