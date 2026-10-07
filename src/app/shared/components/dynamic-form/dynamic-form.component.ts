import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Button, ButtonModule } from 'primeng/button';
import { InputText, InputTextModule } from 'primeng/inputtext';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email';
  placeholder?: string;
  required?: boolean;
  errorMessage?: string;
  fieldClass?: string;
}

/**
 * Reusable dynamic reactive form generator ensuring input validation standards (SEC-04).
 */
@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, Button, ButtonModule, InputText, InputTextModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css',
})
export class AppDynamicFormComponent {
  /** Reactive form instance. */
  readonly form = input.required<FormGroup>();

  /** Form field schema definitions. */
  readonly fields = input.required<FormFieldConfig[]>();

  /** Submit button text label. */
  readonly submitLabel = input<string>('Submit');

  /** Submitting state flag. */
  readonly loading = input<boolean>(false);

  /** Layout structure: 'vertical' | 'horizontal' | 'grid'. */
  readonly layout = input<'vertical' | 'horizontal' | 'grid'>('vertical');

  /** Outer container CSS class. */
  readonly containerClass = input<string>('');

  /** Form-level styleClass for visual parity. */
  readonly styleClass = input<string>('');

  /** Emits form submit event. */
  readonly formSubmit = output<void>();

  /**
   * Handles form submission if valid.
   */
  onSubmit(): void {
    if (this.form().valid) {
      this.formSubmit.emit();
    } else {
      this.form().markAllAsTouched();
    }
  }
}
