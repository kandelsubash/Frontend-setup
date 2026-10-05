import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * SEC-01 compliant safe HTML pipe.
 * Sanitizes raw HTML using Angular's DomSanitizer to mitigate XSS vulnerabilities.
 */
@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  /**
   * Sanitizes untrusted HTML string content safely.
   * @param value Raw HTML input string.
   */
  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, value);
    return sanitized ?? '';
  }
}
