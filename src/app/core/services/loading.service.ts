import { Injectable, signal, computed } from '@angular/core';

/**
 * Service managing global application loading spinner states using Angular Signals.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequestsCount = signal<number>(0);

  /** Read-only computed signal determining whether any asynchronous request is loading. */
  readonly isLoading = computed(() => this.activeRequestsCount() > 0);

  /** Increments the count of active network/async operations. */
  show(): void {
    this.activeRequestsCount.update((count) => count + 1);
  }

  /** Decrements the count of active network/async operations. */
  hide(): void {
    this.activeRequestsCount.update((count) => Math.max(0, count - 1));
  }

  /** Resets loading indicator state. */
  reset(): void {
    this.activeRequestsCount.set(0);
  }
}
