import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Toast, ToastModule } from 'primeng/toast';
import { AppConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { AppLoadingOverlayComponent } from './shared/components/loading-overlay/loading-overlay.component';
import { AppHeaderComponent } from './shared/components/header/header.component';

/**
 * Root application component hosting global messaging, modal overlays, universal header, and router outlet.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterOutlet,
    Toast,
    ToastModule,
    AppConfirmDialogComponent,
    AppLoadingOverlayComponent,
    AppHeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
