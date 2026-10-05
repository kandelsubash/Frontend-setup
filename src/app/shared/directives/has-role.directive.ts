import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';

/**
 * Structural directive conditionally rendering DOM content based on authenticated user roles.
 * Usage: *appHasRole="'ADMIN'" or *appHasRole="['ADMIN', 'MANAGER']"
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  private requiredRoles: string[] = [];
  private hasView = false;

  constructor() {
    effect(() => {
      // Re-evaluate whenever the currentUser signal updates
      this.authService.currentUser();
      this.updateView();
    });
  }

  @Input()
  set appHasRole(roles: string | string[]) {
    this.requiredRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  private updateView(): void {
    if (this.requiredRoles.length === 0) {
      this.show();
      return;
    }

    const authorized = this.authService.hasAnyRole(this.requiredRoles);
    if (authorized && !this.hasView) {
      this.show();
    } else if (!authorized && this.hasView) {
      this.hide();
    }
  }

  private show(): void {
    this.viewContainer.createEmbeddedView(this.templateRef);
    this.hasView = true;
  }

  private hide(): void {
    this.viewContainer.clear();
    this.hasView = false;
  }
}
