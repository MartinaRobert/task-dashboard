import { Task } from '../models/task.model';
import { daysUntil, isTaskOverdue } from './date.utils';

export interface DueLabel {
  key: string;
  params: { count: number };
  icon: string;
}

/**
 * Builds the small date line shown on a task card, for example
 * "Due in 2 days", "Overdue by 1 day" or "Completed yesterday".
 * Returns a translation key + params so the text can be translated.
 */
export function getDueLabel(task: Task, today = new Date()): DueLabel {
  if (task.status === 'done') {
    if (!task.completedAt) return label('due.completed', 0, '✅');
    const daysAgo = -daysUntil(task.completedAt, today);
    if (daysAgo <= 0) return label('due.completedToday', 0, '✅');
    if (daysAgo === 1) return label('due.completedYesterday', 1, '✅');
    return label('due.completedDaysAgo', daysAgo, '✅');
  }

  if (isTaskOverdue(task, today)) {
    const daysLate = -daysUntil(task.dueDate, today);
    return label(daysLate === 1 ? 'due.overdueOneDay' : 'due.overdueDays', daysLate, '⚠️');
  }

  const daysLeft = daysUntil(task.dueDate, today);
  if (daysLeft === 0) return label('due.today', 0, '📅');
  if (daysLeft === 1) return label('due.tomorrow', 1, '📅');
  if (daysLeft === 7) return label('due.inOneWeek', 7, '📅');
  return label('due.inDays', daysLeft, '📅');
}

function label(key: string, count: number, icon: string): DueLabel {
  return { key, params: { count }, icon };
}
