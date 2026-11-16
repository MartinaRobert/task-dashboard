import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { makeTask, provideTestDeps } from '../../../../testing/test-helpers';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { TaskCard } from './task-card';

describe('TaskCard', () => {
  let fixture: ComponentFixture<TaskCard>;
  const render = (task: Task) => {
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TaskCard], providers: provideTestDeps() });
    fixture = TestBed.createComponent(TaskCard);
  });

  it('shows the task details', () => {
    const el = render(makeTask());
    expect(el.querySelector('h3')?.textContent).toContain('Design homepage');
    expect(el.textContent).toContain('@John');
    expect(el.textContent).toContain('priority.high');
    expect(el.textContent).toContain('due.inDays');
    expect(el.querySelectorAll('.card__tags li').length).toBe(1);
  });

  it('highlights overdue tasks and hides empty tags', () => {
    const el = render(makeTask({ isOverdue: true, tags: [] }));
    expect(el.querySelector('.card--overdue')).not.toBeNull();
    expect(el.querySelector('.card__tags')).toBeNull();
  });

  it('emits edit, delete and status change from the menu', async () => {
    const task = makeTask();
    render(task);
    const edited: Task[] = [];
    const deleted: Task[] = [];
    const moved: TaskStatus[] = [];
    fixture.componentInstance.edit.subscribe((t) => edited.push(t));
    fixture.componentInstance.delete.subscribe((t) => deleted.push(t));
    fixture.componentInstance.statusChange.subscribe((e) => moved.push(e.status));

    fixture.debugElement.query(By.css('.card__menu')).nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const items = Array.from(document.querySelectorAll<HTMLButtonElement>('.mat-mdc-menu-item'));
    expect(items.length).toBe(4); // edit + 2 other statuses + delete
    items[0].click();
    items[1].click();
    items[3].click();

    expect(edited).toEqual([task]);
    expect(moved).toEqual(['in_progress']);
    expect(deleted).toEqual([task]);
  });
});
