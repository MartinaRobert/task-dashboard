import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { flushInitialData, makeTask, provideTestDeps, TASKS } from '../../testing/test-helpers';
import { Task, TaskStatus } from '../core/models/task.model';
import { TaskStore } from '../core/services/task-store';
import { TaskDialogService } from '../shared/services/task-dialog.service';
import { ActivityFeed } from './analytics/activity-feed/activity-feed';
import { AnalyticsPage } from './analytics/analytics-page';
import { TaskChart } from './analytics/task-chart/task-chart';
import { ComingSoonPage } from './coming-soon/coming-soon-page';
import { TaskBoard } from './dashboard/task-board/task-board';
import { TaskTable } from './tasks/task-table/task-table';
import { TasksPage } from './tasks/tasks-page';
import { TeamPage } from './team/team-page';

describe('feature pages', () => {
  const dialogs = { openCreate: vi.fn(), openEdit: vi.fn(), confirmDelete: vi.fn() };

  beforeEach(() => {
    dialogs.openEdit.mockClear();
    dialogs.confirmDelete.mockClear();
    TestBed.configureTestingModule({
      providers: [...provideTestDeps(), { provide: TaskDialogService, useValue: dialogs }],
    });
    // Chart.js needs a real canvas, so the chart directive is replaced in tests
    TestBed.overrideComponent(TaskChart, { set: { imports: [], schemas: [NO_ERRORS_SCHEMA] } });
  });

  it('TasksPage lists tasks and opens edit / delete dialogs', async () => {
    const fixture = TestBed.createComponent(TasksPage);
    fixture.detectChanges();
    await flushInitialData();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelectorAll('tr.mat-mdc-row').length).toBe(3);
    const buttons = el.querySelectorAll<HTMLButtonElement>('td.actions button');
    buttons[0].click();
    buttons[1].click();
    expect(dialogs.openEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'task-001' }));
    expect(dialogs.confirmDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'task-001' }));
  });

  it('TaskTable shows an empty row', () => {
    const fixture = TestBed.createComponent(TaskTable);
    fixture.componentRef.setInput('tasks', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('tasks.empty');
  });

  it('TaskBoard forwards card events and shows empty columns', () => {
    const fixture = TestBed.createComponent(TaskBoard);
    const task = makeTask();
    fixture.componentRef.setInput('columns', [
      { status: 'todo', tasks: [task] },
      { status: 'done', tasks: [] },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('tasks.empty');
    expect(fixture.nativeElement.querySelectorAll('app-task-card').length).toBe(1);
  });

  it('TaskBoard emits a status change when a card is dropped in another column', () => {
    const fixture = TestBed.createComponent(TaskBoard);
    const task = makeTask();
    fixture.componentRef.setInput('columns', [{ status: 'todo', tasks: [task] }]);
    fixture.detectChanges();
    const emitted: { task: Task; status: TaskStatus }[] = [];
    fixture.componentInstance.statusChange.subscribe((e) => emitted.push(e));

    const todoList = { data: 'todo' };
    const doneList = { data: 'done' };
    const drop = (from: object, to: object) =>
      ({ previousContainer: from, container: to, item: { data: task } }) as unknown as CdkDragDrop<
        TaskStatus,
        TaskStatus,
        Task
      >;

    fixture.componentInstance.onDrop(drop(todoList, todoList));
    expect(emitted).toEqual([]);

    fixture.componentInstance.onDrop(drop(todoList, doneList));
    expect(emitted).toEqual([{ task, status: 'done' }]);
    expect(fixture.nativeElement.querySelectorAll('[cdkdroplist], .cdk-drop-list').length).toBe(1);
  });

  it('AnalyticsPage builds chart data from the tasks', async () => {
    const fixture = TestBed.createComponent(AnalyticsPage);
    fixture.detectChanges();
    await flushInitialData();
    fixture.detectChanges();
    const page = fixture.componentInstance as unknown as {
      prioritySlices: () => { value: number }[];
      statusSlices: () => { value: number }[];
    };
    expect(page.prioritySlices().map((s) => s.value)).toEqual([1, 1, 1]);
    expect(page.statusSlices().map((s) => s.value)).toEqual([1, 1, 1]);
    expect(fixture.nativeElement.querySelectorAll('app-task-chart').length).toBe(2);
  });

  it('TaskChart builds bar and doughnut options', () => {
    const fixture = TestBed.createComponent(TaskChart);
    fixture.componentRef.setInput('title', 'By status');
    fixture.componentRef.setInput('slices', [{ label: 'Done', value: 2, color: '#000' }]);
    fixture.componentRef.setInput('type', 'bar');
    fixture.detectChanges();
    const chart = fixture.componentInstance as unknown as {
      data: () => { labels: string[] };
      options: () => { scales: object; plugins: { legend: { display: boolean } } };
    };
    expect(chart.data().labels).toEqual(['Done']);
    expect(chart.options().plugins.legend.display).toBe(false);

    fixture.componentRef.setInput('type', 'doughnut');
    expect(chart.options().scales).toEqual({});
    expect(fixture.nativeElement.textContent).toContain('Done: 2');
  });

  it('ActivityFeed shows activities or an empty message', () => {
    const fixture = TestBed.createComponent(ActivityFeed);
    fixture.componentRef.setInput('activities', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('analytics.noActivity');

    fixture.componentRef.setInput('activities', [
      { id: '1', type: 'created', taskTitle: 'A', userName: 'B', date: new Date().toISOString() },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('activity.created');
  });

  it('TeamPage counts tasks per member and opens their tasks', async () => {
    const fixture = TestBed.createComponent(TeamPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-skeleton').length).toBe(4);
    await flushInitialData([...TASKS]);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.member');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('John Doe');

    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    cards[1].querySelector('button').click();
    expect(TestBed.inject(TaskStore).assigneeFilter()).toBe('user-002');
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('ComingSoonPage shows the route title', () => {
    const fixture = TestBed.createComponent(ComingSoonPage);
    fixture.componentRef.setInput('titleKey', 'nav.settings');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('nav.settings');
  });
});
