import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Reusable enterprise reactive form validators enforcing SEC-04 input validation standards.
 */
export class CustomValidators {
  /**
   * Validates that the input is not empty or composed solely of whitespace characters.
   */
  static noWhitespaceOnly(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value == null) {
        return null;
      }
      const isWhitespace = String(control.value).trim().length === 0;
      const isValid = control.value.length === 0 || !isWhitespace;
      return isValid ? null : { whitespace: true };
    };
  }

  /**
   * Validates that the input strictly adheres to valid email syntax.
   */
  static strictEmail(): ValidatorFn {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      return emailRegex.test(control.value) ? null : { invalidEmail: true };
    };
  }

  /**
   * Validates that the text does not contain dangerous HTML or script injection patterns.
   */
  static safeText(): ValidatorFn {
    const dangerousPattern = /<[^>]*>|javascript:|data:/i;
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      return dangerousPattern.test(control.value) ? { unsafeContent: true } : null;
    };
  }

  /**
   * Enforces password complexity rules (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character).
   */
  static passwordStrength(): ValidatorFn {
    const hasUpper = /[A-Z]/;
    const hasLower = /[a-z]/;
    const hasNumber = /[0-9]/;
    const hasSpecial = /[^A-Za-z0-9]/;

    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const valid =
        value.length >= 8 &&
        hasUpper.test(value) &&
        hasLower.test(value) &&
        hasNumber.test(value) &&
        hasSpecial.test(value);

      return valid ? null : { weakPassword: true };
    };
  }
}
