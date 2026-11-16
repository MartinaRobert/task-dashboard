import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Assignee,
  PriorityFilter,
  StatusFilter,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '../../../core/models/task.model';

/**
 * Presentational: status tabs + priority and assignee dropdowns.
 * Uses `model()` so the parent can bind filters two-way: `[(status)]="store.statusFilter"`.
 */
@Component({
  selector: 'app-filter-bar',
  imports: [MatButtonModule, MatFormFieldModule, MatSelectModule, TranslatePipe],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBar {
  readonly status = model<StatusFilter>('all');
  readonly priority = model<PriorityFilter>('all');
  readonly assignee = model<string>('all');
  readonly users = input<Assignee[]>([]);
  readonly newTask = output<void>();

  protected readonly statuses: StatusFilter[] = ['all', ...TASK_STATUSES];
  protected readonly priorities = TASK_PRIORITIES;
}
