import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { Task } from '../../../core/models/task.model';

/** Presentational: tasks in a table with edit and delete buttons. */
@Component({
  selector: 'app-task-table',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule, TranslatePipe],
  templateUrl: './task-table.html',
  styleUrl: './task-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTable {
  readonly tasks = input.required<Task[]>();
  readonly edit = output<Task>();
  readonly delete = output<Task>();

  protected readonly columns = ['title', 'status', 'priority', 'dueDate', 'assignee', 'actions'];

  /** trackBy for mat-table, so rows are reused instead of re-created. */
  protected readonly trackById = (_: number, task: Task) => task.id;
}
