import { TASKS } from '../../../testing/test-helpers';
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

  it('builds a unique, sorted user list from task assignees', () => {
    expect(getUniqueUsers(TASKS).map((u) => u.name)).toEqual(['John Doe', 'Sarah Smith']);
  });
});
