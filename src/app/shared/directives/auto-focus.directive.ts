import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

/**
 * Attribute directive focusing an HTML input or focusable element upon view initialization.
 */
@Directive({
  selector: '[appAutoFocus]',
  standalone: true,
})
export class AutoFocusDirective implements AfterViewInit {
  private readonly host = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.host.nativeElement.focus();
    });
  }
}
