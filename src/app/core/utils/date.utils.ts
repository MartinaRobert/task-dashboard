import { Task } from '../models/task.model';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Returns a local date as `YYYY-MM-DD` (no timezone shift, unlike `toISOString`). */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Turns `YYYY-MM-DD` or a full ISO timestamp into a local Date at midnight.
 * A plain `YYYY-MM-DD` is read as a local day; a timestamp is converted to local time first.
 */
export function fromDateString(value: string): Date {
  if (value.length > 10) {
    const date = new Date(value);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Whole days from `today` until `date`.
 * Positive = in the future, negative = in the past, 0 = today.
 * Both values are reduced to the calendar day so the time of day does not matter.
 */
export function daysUntil(date: string, today: Date = new Date()): number {
  const target = fromDateString(date);
  const start = fromDateString(toDateString(today));
  return Math.round((target.getTime() - start.getTime()) / MS_PER_DAY);
}

/**
 * A task is overdue when it is not done and its due date is before today.
 * We calculate this instead of trusting `task.isOverdue`, because the API only
 * sends that field on a few tasks and never updates it.
 */
export function isTaskOverdue(task: Pick<Task, 'status' | 'dueDate'>, today = new Date()): boolean {
  return task.status !== 'done' && daysUntil(task.dueDate, today) < 0;
}
