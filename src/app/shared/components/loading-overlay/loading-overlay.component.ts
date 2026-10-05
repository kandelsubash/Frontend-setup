import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { LoadingService } from '@core/services/loading.service';

/**
 * Global or container loading spinner overlay bound to LoadingService.
 */
@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ProgressSpinner],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.css',
})
export class AppLoadingOverlayComponent {
  readonly loadingService = inject(LoadingService);
}
