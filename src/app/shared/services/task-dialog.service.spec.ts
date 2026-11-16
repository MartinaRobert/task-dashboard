import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { makeTask, provideTestDeps } from '../../../testing/test-helpers';
import { TaskFormValue } from '../../core/models/task.model';
import { TaskStore } from '../../core/services/task-store';
import { TaskDialogService } from './task-dialog.service';

describe('TaskDialogService', () => {
  let service: TaskDialogService;
  let afterClosedValue: unknown;
  const store = { users: () => [], create: vi.fn(), update: vi.fn(), delete: vi.fn() };
  const dialog = { open: vi.fn(() => ({ afterClosed: () => of(afterClosedValue) })) };
  const value = { title: 'T' } as TaskFormValue;

  // Dialog components are loaded with import(), so we wait until the dialog was opened
  const opened = (times = 1) => vi.waitFor(() => expect(dialog.open).toHaveBeenCalledTimes(times));

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ...provideTestDeps(),
        { provide: TaskStore, useValue: store },
        { provide: MatDialog, useValue: dialog },
      ],
    });
    service = TestBed.inject(TaskDialogService);
  });

  it('creates a task when the form is submitted', async () => {
    afterClosedValue = value;
    service.openCreate();
    await opened();
    expect(store.create).toHaveBeenCalledWith(value);
  });

  it('does nothing when the form is cancelled', async () => {
    afterClosedValue = undefined;
    service.openCreate();
    await opened();
    expect(store.create).not.toHaveBeenCalled();
  });

  it('updates the task after editing', async () => {
    const task = makeTask();
    afterClosedValue = value;
    service.openEdit(task);
    await opened();
    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: { task, users: [] } }),
    );
    expect(store.update).toHaveBeenCalledWith(task, value);
  });

  it('deletes only after confirmation', async () => {
    const task = makeTask();
    afterClosedValue = false;
    service.confirmDelete(task);
    await opened();
    expect(store.delete).not.toHaveBeenCalled();

    afterClosedValue = true;
    service.confirmDelete(task);
    await opened(2);
    expect(store.delete).toHaveBeenCalledWith(task);
  });
});
