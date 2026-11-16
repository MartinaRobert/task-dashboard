import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, from, Observable, switchMap } from 'rxjs';
import { Task, TaskFormValue } from '../../core/models/task.model';
import { LanguageService } from '../../core/services/language.service';
import { TaskStore } from '../../core/services/task-store';
import type { ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog';
import type { TaskFormDialogData } from '../components/task-form-dialog/task-form-dialog';

/**
 * Opens the create / edit / delete dialogs and sends the result to the store.
 * Keeps pages small: they just call `openCreate()`, `openEdit(task)` or `confirmDelete(task)`.
 */
@Injectable({ providedIn: 'root' })
export class TaskDialogService {
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(TaskStore);
  private readonly language = inject(LanguageService);

  openCreate(): void {
    this.openForm({ users: this.store.users() })
      .pipe(filter((value): value is TaskFormValue => !!value))
      .subscribe((value) => this.store.create(value));
  }

  openEdit(task: Task): void {
    this.openForm({ task, users: this.store.users() })
      .pipe(filter((value): value is TaskFormValue => !!value))
      .subscribe((value) => this.store.update(task, value));
  }

  confirmDelete(task: Task): void {
    const data: ConfirmDialogData = {
      titleKey: 'dialog.deleteTitle',
      messageKey: 'dialog.deleteMessage',
      params: { title: task.title },
    };
    from(import('../components/confirm-dialog/confirm-dialog'))
      .pipe(
        switchMap(({ ConfirmDialog }) =>
          this.dialog
            .open<unknown, ConfirmDialogData, boolean>(ConfirmDialog, {
              data,
              direction: this.language.direction(),
              role: 'alertdialog',
            })
            .afterClosed(),
        ),
        filter((confirmed) => confirmed === true),
      )
      .subscribe(() => this.store.delete(task));
  }

  /** The dialog code is loaded only the first time a dialog opens (smaller initial bundle). */
  private openForm(data: TaskFormDialogData): Observable<TaskFormValue | undefined> {
    return from(import('../components/task-form-dialog/task-form-dialog')).pipe(
      switchMap(({ TaskFormDialog }) =>
        this.dialog
          .open<unknown, TaskFormDialogData, TaskFormValue>(TaskFormDialog, {
            data,
            width: '600px',
            maxWidth: '95vw',
            direction: this.language.direction(),
            autoFocus: 'first-tabbable',
          })
          .afterClosed(),
      ),
    );
  }
}
