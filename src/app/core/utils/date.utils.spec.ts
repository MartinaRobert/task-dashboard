import { daysUntil, fromDateString, isTaskOverdue, toDateString } from './date.utils';

describe('date utils', () => {
  const today = new Date(2026, 10, 16, 23, 30); // 16 Nov 2026, late evening

  it('formats a local date as YYYY-MM-DD', () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('parses a date-only string as a local day', () => {
    const date = fromDateString('2026-11-16');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 10, 16]);
  });

  it('parses a full timestamp into its local day at midnight', () => {
    const date = fromDateString(new Date(2026, 10, 16, 15, 0).toISOString());
    expect(date.getDate()).toBe(16);
    expect(date.getHours()).toBe(0);
  });

  it('counts whole days ignoring the time of day', () => {
    expect(daysUntil('2026-11-16', today)).toBe(0);
    expect(daysUntil('2026-11-18', today)).toBe(2);
    expect(daysUntil('2026-11-13', today)).toBe(-3);
  });

  it('marks a task overdue only when it is not done and the date has passed', () => {
    expect(isTaskOverdue({ status: 'todo', dueDate: '2026-11-15' }, today)).toBe(true);
    expect(isTaskOverdue({ status: 'done', dueDate: '2026-11-15' }, today)).toBe(false);
    expect(isTaskOverdue({ status: 'in_progress', dueDate: '2026-11-16' }, today)).toBe(false);
  });
});
