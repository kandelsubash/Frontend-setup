import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss';
const DEFAULT_LOCALE = 'en-US';

/**
 * Standardized date formatting pipe ensuring consistent presentation format across all views.
 */
@Pipe({
  name: 'appDateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  /**
   * Formats a given date value into a standardized date string.
   * @param value Date object, timestamp, or ISO string.
   * @param format Custom format string, defaulting to 'yyyy-MM-dd HH:mm:ss'.
   * @param locale Locale string, defaulting to 'en-US'.
   */
  transform(
    value: Date | string | number | null | undefined,
    format: string = DEFAULT_DATE_FORMAT,
    locale: string = DEFAULT_LOCALE,
  ): string {
    if (!value) {
      return '';
    }
    try {
      return formatDate(value, format, locale);
    } catch {
      return String(value);
    }
  }
}
