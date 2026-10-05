import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Reusable page header component supporting title, subtitle, and action projections.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
})
export class AppPageHeaderComponent {
  /** Page title heading. */
  readonly title = input.required<string>();

  /** Optional descriptive subtitle. */
  readonly subtitle = input<string>('');
}
