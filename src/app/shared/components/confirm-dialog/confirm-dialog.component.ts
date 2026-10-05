import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConfirmDialog } from 'primeng/confirmdialog';

/**
 * Standard confirmation dialog component wrapping PrimeNG ConfirmDialog.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConfirmDialog],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class AppConfirmDialogComponent {}
