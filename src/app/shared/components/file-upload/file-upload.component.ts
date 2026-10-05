import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUpload, FileUploadModule, FileUploadEvent } from 'primeng/fileupload';

/**
 * Reusable file upload wrapper around PrimeNG FileUpload.
 */
@Component({
  selector: 'app-file-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FileUpload, FileUploadModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
})
export class AppFileUploadComponent {
  /** Upload mode ('basic' or 'advanced'). */
  readonly mode = input<'basic' | 'advanced'>('advanced');

  /** Form field name. */
  readonly name = input<string>('files[]');

  /** Endpoint URL for upload. */
  readonly url = input<string>('');

  /** Accepted file extensions or MIME types. */
  readonly accept = input<string>('*/*');

  /** Max file size in bytes (default 5MB). */
  readonly maxFileSize = input<number>(5000000);

  /** Emits on upload completion. */
  readonly uploaded = output<FileUploadEvent>();

  /**
   * Dispatches upload event.
   * @param event PrimeNG FileUploadEvent.
   */
  onUploadEvent(event: FileUploadEvent): void {
    this.uploaded.emit(event);
  }
}
