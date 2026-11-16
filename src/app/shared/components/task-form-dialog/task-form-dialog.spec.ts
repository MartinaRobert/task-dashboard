import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { makeTask, provideTestDeps, USERS } from '../../../../testing/test-helpers';
import { Task } from '../../../core/models/task.model';
import { TaskFormDialog } from './task-form-dialog';

describe('TaskFormDialog', () => {
  let fixture: ComponentFixture<TaskFormDialog>;
  let component: TaskFormDialog;
  const dialogRef = { close: vi.fn() };

  const create = (task?: Task) => {
    TestBed.configureTestingModule({
      imports: [TaskFormDialog],
      providers: [
        ...provideTestDeps(),
        { provide: MAT_DIALOG_DATA, useValue: { task, users: USERS } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    fixture = TestBed.createComponent(TaskFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => dialogRef.close.mockClear());

  it('does not submit an empty form and shows errors', () => {
    create();
    component.submit();
    fixture.detectChanges();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('validation.required');
  });

  it('submits trimmed values with the due date as YYYY-MM-DD', () => {
    create();
    const { controls } = component.form;
    controls.title.setValue('  New task  ');
    controls.dueDate.setValue(new Date(2099, 0, 2));
    controls.assigneeId.setValue('user-002');
    component.addTag('UI');
    component.submit();

    expect(dialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New task',
        dueDate: '2099-01-02',
        assigneeId: 'user-002',
        tags: ['UI'],
      }),
    );
  });

  it('blocks past due dates for new tasks only', () => {
    create();
    component.form.controls.dueDate.setValue(new Date(2000, 0, 1));
    expect(component.form.controls.dueDate.errors).toEqual({ pastDate: true });
  });

  it('fills the form when editing and allows an old due date', () => {
    create(makeTask({ dueDate: '2000-01-01', tags: ['A', 'B'] }));
    expect(component.form.controls.dueDate.errors).toBeNull();
    expect(component.tags.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('form.editTitle');
  });

  it('adds, limits and removes tags', () => {
    create();
    component.addTag('  ');
    expect(component.tags.length).toBe(0);
    ['a', 'b', 'c', 'd', 'e', 'f'].forEach((t) => component.addTag(t));
    expect(component.tags.length).toBe(5);
    component.removeTag(0);
    expect(component.tags.value).toEqual(['b', 'c', 'd', 'e']);

    component.addTag('B');
    expect(component.tags.hasError('duplicateTags')).toBe(true);
  });

  it('adds a tag on Enter without submitting the form', () => {
    create();
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    const prevent = vi.spyOn(event, 'preventDefault');
    component.tagInput.setValue('Ops');
    component.onTagKeydown(event);
    expect(prevent).toHaveBeenCalled();
    expect(component.tags.value).toEqual(['Ops']);
  });
});
