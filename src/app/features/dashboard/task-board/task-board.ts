import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { TaskColumn } from '../../../core/services/task-store';
import { TaskCard } from '../../../shared/components/task-card/task-card';

/**
 * Presentational: shows the tasks in status columns (To Do / In Progress / Done).
 * Cards can be dragged to another column to change their status.
 */
@Component({
  selector: 'app-task-board',
  imports: [TaskCard, TranslatePipe, CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './task-board.html',
  styleUrl: './task-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskBoard {
  readonly columns = input.required<TaskColumn[]>();

  readonly edit = output<Task>();
  readonly delete = output<Task>();
  readonly statusChange = output<{ task: Task; status: TaskStatus }>();

  // On touch screens a long press starts the drag, so normal scrolling still works
  protected readonly dragDelay = { touch: 250, mouse: 0 };

  /** Each drop list holds its column status, so dropping in another list means a new status. */
  onDrop(event: CdkDragDrop<TaskStatus, TaskStatus, Task>): void {
    if (event.previousContainer === event.container) return;
    this.statusChange.emit({ task: event.item.data, status: event.container.data });
  }
}
