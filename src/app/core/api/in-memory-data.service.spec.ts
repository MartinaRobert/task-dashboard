import { RequestInfo, ResponseOptions } from 'angular-in-memory-web-api';
import { STATISTICS, TASKS } from '../../../testing/test-helpers';
import { getUniqueUsers, InMemoryDataService } from './in-memory-data.service';

describe('InMemoryDataService', () => {
  const service = new InMemoryDataService();

  it('serves tasks, users and statistics from the generated JSON', () => {
    const db = service.createDb();
    expect(db.tasks.length).toBeGreaterThan(0);
    expect(db.users.length).toBe(4);
    expect(db.statistics.length).toBe(4);
  });

  it('generates the next id for a collection', () => {
    expect(service.genId([{ id: 'task-001' }, { id: 'task-017' }], 'tasks')).toBe('task-018');
    expect(service.genId([], 'tasks')).toBe('task-001');
  });

  describe('responseInterceptor', () => {
    const request = (collectionName: string, method = 'get', id?: string) =>
      ({ collectionName, method, id }) as RequestInfo;
    const intercept = (body: unknown, req: RequestInfo) =>
      service.responseInterceptor({ body } as ResponseOptions, req).body;

    it('wraps the task list as { tasks, meta }', () => {
      expect(intercept(TASKS, request('tasks'))).toEqual({
        tasks: TASKS,
        meta: { totalCount: 3, lastUpdated: expect.any(String) },
      });
    });

    it('wraps statistics as { statistics, lastUpdated }', () => {
      expect(intercept(STATISTICS, request('statistics'))).toEqual({
        statistics: STATISTICS,
        lastUpdated: expect.any(String),
      });
    });

    it('leaves single items, writes and other collections unchanged', () => {
      expect(intercept(TASKS[0], request('tasks', 'get', 'task-001'))).toBe(TASKS[0]);
      expect(intercept(TASKS[0], request('tasks', 'post'))).toBe(TASKS[0]);
      expect(intercept([], request('users'))).toEqual([]);
    });
  });

  it('builds a unique, sorted user list from task assignees', () => {
    expect(getUniqueUsers(TASKS).map((u) => u.name)).toEqual(['John Doe', 'Sarah Smith']);
  });
});
