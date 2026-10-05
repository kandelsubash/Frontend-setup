import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Button, ButtonModule } from 'primeng/button';

/**
 * Standard error display component for 403 Forbidden, 404 Not Found, and 500 server errors.
 */
@Component({
  selector: 'app-error-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, Button, ButtonModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.css',
})
export class AppErrorPageComponent {
  /** Numeric error status code (e.g. 403, 404, 500). */
  readonly code = input<string>('404');

  /** Error page heading. */
  readonly title = input<string>('Page Not Found');

  /** Detailed user-safe explanation. */
  readonly message = input<string>(
    'The requested page does not exist or you do not have sufficient permissions to view it.',
  );

  /** Destination link for return button. */
  readonly homeUrl = input<string>('/');
}
