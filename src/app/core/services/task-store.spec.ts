import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { flushInitialData, provideTestDeps, settle, TASKS } from '../../../testing/test-helpers';
import { API_URLS } from '../api/task-api.service';
import { TaskFormValue } from '../models/task.model';
import { NotificationService } from './notification.service';
import { TaskStore } from './task-store';

describe('TaskStore', () => {
  let store: TaskStore;
  let httpMock: HttpTestingController;
  const notification = { success: vi.fn(), error: vi.fn() };

  const formValue: TaskFormValue = {
    title: 'New task',
    description: 'Details',
    status: 'todo',
    priority: 'low',
    dueDate: '2099-01-01',
    assigneeId: 'user-002',
    tags: ['A'],
  };

  beforeEach(() => {
    notification.success.mockClear();
    TestBed.configureTestingModule({
      providers: [...provideTestDeps(), { provide: NotificationService, useValue: notification }],
    });
    store = TestBed.inject(TaskStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('is loading until the data arrives', async () => {
    TestBed.tick();
    expect(store.isLoading()).toBe(true);
    await flushInitialData();
    expect(store.isLoading()).toBe(false);
    expect(store.tasks().length).toBe(3);
    expect(store.users().length).toBe(2);
  });

  it('calculates overdue itself instead of trusting the API', async () => {
    await flushInitialData([{ ...TASKS[0], isOverdue: true }, TASKS[1], TASKS[2]]);
    const overdue = store
      .tasks()
      .filter((t) => t.isOverdue)
      .map((t) => t.id);
    expect(overdue).toEqual(['task-002']);
  });

  it('reports an error when loading fails', async () => {
    TestBed.tick();
    httpMock.expectOne(API_URLS.tasks).flush(null, { status: 404, statusText: 'Not Found' });
    httpMock.match(() => true).forEach((req) => req.flush([]));
    await settle();
    expect(store.hasError()).toBe(true);
    expect(store.tasks()).toEqual([]);

    store.reload();
    TestBed.tick();
    httpMock.expectOne(API_URLS.tasks).flush(TASKS);
    await settle();
    expect(store.hasError()).toBe(false);
  });

  it('builds stat cards from live tasks plus API change labels', async () => {
    await flushInitialData();
    const [total, completed, inProgress, overdue] = store.stats();
    expect(total).toMatchObject({ value: 3, change: '+12', changeLabelKey: 'stats.thisWeek' });
    expect(completed).toMatchObject({ value: 1, changeLabelKey: '', changeType: 'neutral' });
    expect(inProgress.changeLabelKey).toBe('Something new');
    expect(overdue.value).toBe(1);
  });

  describe('filters', () => {
    beforeEach(() => flushInitialData());

    it('filters by status, priority and assignee', async () => {
      store.statusFilter.set('done');
      expect(store.filteredTasks().map((t) => t.id)).toEqual(['task-003']);
      expect(store.columns().map((c) => c.status)).toEqual(['done']);

      store.resetFilters();
      store.priorityFilter.set('medium');
      expect(store.filteredTasks().map((t) => t.id)).toEqual(['task-002']);

      store.resetFilters();
      store.assigneeFilter.set('user-001');
      expect(store.filteredTasks().length).toBe(2);
    });

    it('searches title and description without case', async () => {
      store.searchQuery.set('LOGIN');
      expect(store.filteredTasks().map((t) => t.id)).toEqual(['task-002']);
      store.searchQuery.set('wireframes');
      expect(store.filteredTasks().map((t) => t.id)).toEqual(['task-001']);
    });

    it('groups tasks into three columns', async () => {
      expect(store.columns().map((c) => c.tasks.length)).toEqual([1, 1, 1]);
    });
  });

  describe('write actions', () => {
    beforeEach(() => flushInitialData());

    it('creates a task with the chosen assignee', async () => {
      store.create({ ...formValue, status: 'done' });
      const req = httpMock.expectOne({ method: 'POST', url: API_URLS.tasks });
      expect(req.request.body.assignee.name).toBe('Sarah Smith');
      expect(req.request.body.completedAt).toBeDefined();
      req.flush({ ...req.request.body, id: 'task-004' });

      expect(store.tasks()[0].id).toBe('task-004');
      expect(store.activities()[0]).toMatchObject({ type: 'created', taskTitle: 'New task' });
      expect(notification.success).toHaveBeenCalledWith('messages.created');
    });

    it('throws for an unknown assignee', async () => {
      expect(() => store.create({ ...formValue, assigneeId: 'nobody' })).toThrow();
    });

    it('updates a task', async () => {
      store.update(store.tasks()[0], { ...formValue, title: 'Renamed', status: 'todo' });
      httpMock.expectOne({ method: 'PUT', url: `${API_URLS.tasks}/task-001` }).flush(null);

      expect(store.tasks()[0].title).toBe('Renamed');
      expect(store.activities()[0].type).toBe('updated');
    });

    it('sets completedAt when moved to done and clears it when moved back', async () => {
      const task = store.tasks()[0];
      store.changeStatus(task, 'done');
      httpMock.expectOne(`${API_URLS.tasks}/task-001`).flush(null);
      expect(store.tasks()[0].completedAt).toBeDefined();
      expect(store.activities()[0].type).toBe('completed');

      store.changeStatus(store.tasks()[0], 'in_progress');
      httpMock.expectOne(`${API_URLS.tasks}/task-001`).flush(null);
      expect(store.tasks()[0].completedAt).toBeUndefined();
      expect(store.activities()[0].type).toBe('moved');
    });

    it('does nothing when the status is the same', async () => {
      store.changeStatus(store.tasks()[0], 'todo');
      httpMock.expectNone(`${API_URLS.tasks}/task-001`);
    });

    it('deletes a task', async () => {
      store.delete(store.tasks()[1]);
      httpMock.expectOne({ method: 'DELETE', url: `${API_URLS.tasks}/task-002` }).flush(null);

      expect(store.tasks().map((t) => t.id)).toEqual(['task-001', 'task-003']);
      expect(store.activities()[0].type).toBe('deleted');
    });

    it('keeps the list unchanged when saving fails', async () => {
      store.delete(store.tasks()[0]);
      httpMock
        .expectOne(`${API_URLS.tasks}/task-001`)
        .flush(null, { status: 500, statusText: 'Error' });
      expect(store.tasks().length).toBe(3);
    });
  });
});
