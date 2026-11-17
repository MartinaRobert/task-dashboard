import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Assignee,
  Task,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TaskFormValue,
  TaskPriority,
  TaskStatus,
} from '../../../core/models/task.model';
import { fromDateString, toDateString } from '../../../core/utils/date.utils';
import {
  getErrorMessage,
  notBlankValidator,
  notInPastValidator,
  uniqueTagsValidator,
} from '../../validators/task.validators';

export interface TaskFormDialogData {
  task?: Task;
  users: Assignee[];
}

export const MAX_TAGS = 5;

/** Create / edit form. Closes with a `TaskFormValue`, or with nothing when cancelled. */
@Component({
  selector: 'app-task-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './task-form-dialog.html',
  styleUrl: './task-form-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialog, TaskFormValue>);
  protected readonly data = inject<TaskFormDialogData>(MAT_DIALOG_DATA);

  protected readonly isEdit = !!this.data.task;
  protected readonly statuses = TASK_STATUSES;
  protected readonly priorities = TASK_PRIORITIES;
  protected readonly getErrorMessage = getErrorMessage;
  protected readonly maxTags = MAX_TAGS;

  readonly form = this.fb.group({
    title: [
      '',
      [Validators.required, notBlankValidator, Validators.minLength(3), Validators.maxLength(80)],
    ],
    description: ['', [Validators.maxLength(300)]],
    status: this.fb.control<TaskStatus>('todo'),
    priority: this.fb.control<TaskPriority>('medium'),
    // Past dates are only blocked for new tasks, so old overdue tasks can still be edited
    dueDate: this.fb.control<Date | null>(
      null,
      this.isEdit ? [Validators.required] : [Validators.required, notInPastValidator],
    ),
    assigneeId: ['', [Validators.required]],
    tags: this.fb.array<FormControl<string>>(
      [],
      [uniqueTagsValidator, Validators.maxLength(MAX_TAGS)],
    ),
  });

  readonly tagInput = new FormControl('', { nonNullable: true });

  constructor() {
    const task = this.data.task;
    if (task) {
      this.form.patchValue({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: fromDateString(task.dueDate),
        assigneeId: task.assignee.id,
      });
      task.tags.forEach((tag) => this.addTag(tag));
    }
  }

  get tags() {
    return this.form.controls.tags;
  }

  /** Adds a tag control to the FormArray (dynamic form control). */
  addTag(value = this.tagInput.value): void {
    const tag = value.trim();
    if (!tag || this.tags.length >= MAX_TAGS) return;
    const alreadyAdded = this.tags.value.some((t) => t.toLowerCase() === tag.toLowerCase());
    if (alreadyAdded) {
      this.tagInput.setErrors({ duplicateTags: true });
      this.tagInput.markAsTouched();
      return;
    }
    this.tags.push(this.fb.control(tag));
    this.tagInput.reset();
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  onTagKeydown(event: Event): void {
    event.preventDefault();
    this.addTag();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.dialogRef.close({
      ...value,
      title: value.title.trim(),
      description: value.description.trim(),
      dueDate: toDateString(value.dueDate as Date),
    });
  }
}
