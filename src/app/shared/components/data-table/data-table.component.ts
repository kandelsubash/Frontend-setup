import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, SortIcon, TableModule } from 'primeng/table';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  width?: string;
}

/**
 * Reusable table component wrapping PrimeNG Table with OnPush change detection and signals.
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, Table, SortIcon, TableModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
})
export class AppDataTableComponent<T extends Record<string, unknown>> {
  /** Column metadata array. */
  readonly columns = input.required<TableColumn[]>();

  /** Row data array. */
  readonly data = input<T[]>([]);

  /** Loading state indicator. */
  readonly loading = input<boolean>(false);

  /** Enables paginator. */
  readonly paginator = input<boolean>(true);

  /** Rows per page. */
  readonly rows = input<number>(10);

  /** Empty table message. */
  readonly emptyMessage = input<string>('No records found.');
}
