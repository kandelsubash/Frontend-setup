import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Reusable debounced search input component.
 */
@Component({
  selector: 'app-search-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, InputText, InputTextModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class AppSearchBarComponent implements OnDestroy {
  /** Placeholder text for search input. */
  readonly placeholder = input<string>('Search...');

  /** Debounce delay in milliseconds. */
  readonly debounceMs = input<number>(300);

  /** Emits debounced search query string. */
  readonly searchChange = output<string>();

  /** Current query state signal. */
  readonly currentQuery = signal<string>('');

  private readonly querySubject = new Subject<string>();
  private readonly sub: Subscription;

  constructor() {
    this.sub = this.querySubject
      .pipe(debounceTime(this.debounceMs()), distinctUntilChanged())
      .subscribe((query) => {
        this.searchChange.emit(query);
      });
  }

  /**
   * Dispatches input event value to debounce stream.
   * @param event DOM input event.
   */
  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.currentQuery.set(value);
    this.querySubject.next(value);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.querySubject.complete();
  }
}
