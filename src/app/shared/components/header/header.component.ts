import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { Popover, PopoverModule } from 'primeng/popover';
import { Tooltip, TooltipModule } from 'primeng/tooltip';
import { Dialog, DialogModule } from 'primeng/dialog';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * Notification item structure for the header notifications popover.
 */
export interface NotificationAlert {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly timeAgo: string;
  readonly severity: 'info' | 'warn' | 'success';
  readonly read: boolean;
}

/**
 * Universal sticky header replica for Cotiviti enterprise platform.
 * Features:
 * - Brand typography: COTIVITI with red accented first 'I'
 * - Sticky navigation pinned at top of viewport across all routes
 * - Very light brown background container with bold header and subheader text
 * - Navigation dropdowns with menu1, menu2, menu3 subheaders
 * - '?' Help icon opens informative application dialog popup
 * - 9-dots suite icon contains Cotiviti Administrator profile and actions
 * - Fully responsive with off-canvas mobile drawer
 */
@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    Menu,
    MenuModule,
    Popover,
    PopoverModule,
    Tooltip,
    TooltipModule,
    Dialog,
    DialogModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class AppHeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Mobile navigation overlay visibility */
  readonly mobileMenuOpen = signal<boolean>(false);

  /** Active mobile accordion section */
  readonly expandedMobileSection = signal<string | null>(null);

  /** Current logged-in user profile */
  readonly currentUser = this.authService.currentUser;

  /** Unread notifications count */
  readonly unreadCount = signal<number>(3);

  /** Help Information Dialog popup visibility */
  readonly helpDialogVisible = signal<boolean>(false);

  /** Notification alerts list */
  readonly notifications = signal<NotificationAlert[]>([
    {
      id: 'notif-1',
      title: 'Batch Processing Complete',
      message: 'EDI Ingestion Batch #8491 processed 14,280 claim records.',
      timeAgo: '2m ago',
      severity: 'success',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'High Exception Spike',
      message: '18 new exceptions flagged in Medicare Part B adjudication pool.',
      timeAgo: '15m ago',
      severity: 'warn',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Scheduled Maintenance',
      message: 'CDIP Pipeline Engine maintenance tonight at 10:00 PM EST.',
      timeAgo: '1h ago',
      severity: 'info',
      read: false,
    },
  ]);

  // ==========================================
  // NAVIGATION DROPDOWN MENUS (menu1, menu2, menu3)
  // ==========================================

  readonly flmsItems: MenuItem[] = [
    { label: 'menu1', command: () => this.navigateTo('/dashboard') },
    { label: 'menu2', command: () => this.navigateTo('/dashboard') },
    { label: 'menu3', command: () => this.navigateTo('/dashboard') },
  ];

  readonly dataProfilerItems: MenuItem[] = [
    { label: 'menu1', command: () => this.navigateTo('/dashboard') },
    { label: 'menu2', command: () => this.navigateTo('/dashboard') },
    { label: 'menu3', command: () => this.navigateTo('/dashboard') },
  ];

  readonly importItems: MenuItem[] = [
    { label: 'menu1', command: () => this.navigateTo('/dashboard') },
    { label: 'menu2', command: () => this.navigateTo('/dashboard') },
    { label: 'menu3', command: () => this.navigateTo('/dashboard') },
  ];

  readonly bulkItems: MenuItem[] = [
    { label: 'menu1', command: () => this.navigateTo('/dashboard') },
    { label: 'menu2', command: () => this.navigateTo('/dashboard') },
    { label: 'menu3', command: () => this.navigateTo('/dashboard') },
  ];

  readonly reportsItems: MenuItem[] = [
    { label: 'menu1', command: () => this.navigateTo('/dashboard') },
    { label: 'menu2', command: () => this.navigateTo('/dashboard') },
    { label: 'menu3', command: () => this.navigateTo('/dashboard') },
  ];

  readonly fileManagerItems: MenuItem[] = [
    { label: 'menu1', command: () => this.navigateTo('/dashboard') },
    { label: 'menu2', command: () => this.navigateTo('/dashboard') },
    { label: 'menu3', command: () => this.navigateTo('/dashboard') },
  ];

  readonly exceptionsItems: MenuItem[] = [
    { label: 'menu1', command: () => this.navigateTo('/dashboard') },
    { label: 'menu2', command: () => this.navigateTo('/dashboard') },
    { label: 'menu3', command: () => this.navigateTo('/dashboard') },
  ];

  readonly cdipItems: MenuItem[] = [
    { label: 'menu1', command: () => this.navigateTo('/dashboard') },
    { label: 'menu2', command: () => this.navigateTo('/dashboard') },
    { label: 'menu3', command: () => this.navigateTo('/dashboard') },
  ];

  readonly adminItems: MenuItem[] = [
    { label: 'menu1', command: () => this.navigateTo('/users') },
    { label: 'menu2', command: () => this.navigateTo('/users') },
    { label: 'menu3', command: () => this.navigateTo('/users') },
  ];

  readonly settingsItems: MenuItem[] = [
    { label: 'menu1', command: () => this.navigateTo('/dashboard') },
    { label: 'menu2', command: () => this.navigateTo('/dashboard') },
    { label: 'menu3', command: () => this.navigateTo('/dashboard') },
  ];

  /**
   * Opens the Help/Information dialog popup.
   */
  openHelpDialog(): void {
    this.helpDialogVisible.set(true);
  }

  /**
   * Toggles the mobile drawer menu.
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  /**
   * Closes the mobile navigation drawer.
   */
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  /**
   * Toggles an accordion category in mobile mode.
   */
  toggleMobileSection(section: string): void {
    this.expandedMobileSection.update((current) =>
      current === section ? null : section,
    );
  }

  /**
   * Marks all alerts as read.
   */
  markAllNotificationsRead(): void {
    this.notifications.update((list) =>
      list.map((item) => ({ ...item, read: true })),
    );
    this.unreadCount.set(0);
  }

  /**
   * Navigates to a specific route and closes mobile overlay.
   */
  navigateTo(path: string): void {
    this.closeMobileMenu();
    this.router.navigateByUrl(path);
  }

  /**
   * Handles user sign-out action.
   */
  async onSignOut(): Promise<void> {
    this.closeMobileMenu();
    await this.authService.logout();
    this.router.navigate(['/dashboard']);
  }
}
