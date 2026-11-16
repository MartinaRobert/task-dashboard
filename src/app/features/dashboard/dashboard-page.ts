import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Task, TaskStatus } from '../../core/models/task.model';
import { TaskStore } from '../../core/services/task-store';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { FilterBar } from '../../shared/components/filter-bar/filter-bar';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { TaskDialogService } from '../../shared/services/task-dialog.service';
import { TaskBoard } from './task-board/task-board';

/** Smart page: reads data from the store and passes it down to presentational components. */
@Component({
  selector: 'app-dashboard-page',
  imports: [StatCard, FilterBar, TaskBoard, Skeleton, ErrorState, TranslatePipe],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  protected readonly store = inject(TaskStore);
  protected readonly taskDialog = inject(TaskDialogService);

  protected readonly skeletonStats = [1, 2, 3, 4];
  protected readonly skeletonColumns = [1, 2, 3];

  protected onStatusChange(event: { task: Task; status: TaskStatus }): void {
    this.store.changeStatus(event.task, event.status);
  }
}
