import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { Task, TASK_STATUSES, TaskStatus } from '../../../core/models/task.model';
import { getDueLabel } from '../../../core/utils/due-label';

/** Presentational: shows one task. It never changes data itself, it only emits events. */
@Component({
  selector: 'app-task-card',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, TranslatePipe],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCard {
  readonly task = input.required<Task>();

  readonly edit = output<Task>();
  readonly delete = output<Task>();
  readonly statusChange = output<{ task: Task; status: TaskStatus }>();

  protected readonly due = computed(() => getDueLabel(this.task()));
  protected readonly firstName = computed(() => this.task().assignee.name.split(' ')[0]);
  protected readonly otherStatuses = computed(() =>
    TASK_STATUSES.filter((status) => status !== this.task().status),
  );
}
