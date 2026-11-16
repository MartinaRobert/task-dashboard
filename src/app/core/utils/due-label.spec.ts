import { makeTask } from '../../../testing/test-helpers';
import { getDueLabel } from './due-label';

describe('getDueLabel', () => {
  const today = new Date(2026, 10, 16, 10, 0);
  const at = (day: number) => new Date(2026, 10, day, 12, 0).toISOString();

  it.each([
    ['2026-11-16', 'due.today', 0],
    ['2026-11-17', 'due.tomorrow', 1],
    ['2026-11-23', 'due.inOneWeek', 7],
    ['2026-11-20', 'due.inDays', 4],
    ['2026-11-15', 'due.overdueOneDay', 1],
    ['2026-11-13', 'due.overdueDays', 3],
  ])('for due date %s returns %s', (dueDate, key, count) => {
    const label = getDueLabel(makeTask({ dueDate }), today);
    expect(label.key).toBe(key);
    expect(label.params.count).toBe(count);
  });

  it('uses completion date for done tasks', () => {
    const done = (completedAt?: string) =>
      getDueLabel(makeTask({ status: 'done', completedAt }), today).key;
    expect(done(at(16))).toBe('due.completedToday');
    expect(done(at(15))).toBe('due.completedYesterday');
    expect(done(at(12))).toBe('due.completedDaysAgo');
    expect(done(undefined)).toBe('due.completed');
  });

  it('never shows a done task as overdue', () => {
    const label = getDueLabel(
      makeTask({ status: 'done', dueDate: '2026-11-01', completedAt: at(16) }),
      today,
    );
    expect(label.icon).toBe('✅');
  });
});
