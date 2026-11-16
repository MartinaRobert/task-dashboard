import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { TaskColumn } from '../../../core/services/task-store';
import { TaskCard } from '../../../shared/components/task-card/task-card';

/** Presentational: shows the tasks in status columns (To Do / In Progress / Done). */
@Component({
  selector: 'app-task-board',
  imports: [TaskCard, TranslatePipe],
  templateUrl: './task-board.html',
  styleUrl: './task-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskBoard {
  readonly columns = input.required<TaskColumn[]>();

  readonly edit = output<Task>();
  readonly delete = output<Task>();
  readonly statusChange = output<{ task: Task; status: TaskStatus }>();
}
