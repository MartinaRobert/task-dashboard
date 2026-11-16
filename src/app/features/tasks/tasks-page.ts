import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TaskStore } from '../../core/services/task-store';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { FilterBar } from '../../shared/components/filter-bar/filter-bar';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { TaskDialogService } from '../../shared/services/task-dialog.service';
import { TaskTable } from './task-table/task-table';

/** Smart page: the same tasks and filters as the dashboard, shown as a table. */
@Component({
  selector: 'app-tasks-page',
  imports: [FilterBar, TaskTable, Skeleton, ErrorState, TranslatePipe],
  templateUrl: './tasks-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPage {
  protected readonly store = inject(TaskStore);
  protected readonly taskDialog = inject(TaskDialogService);
}
