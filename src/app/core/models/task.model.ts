export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type ChangeType = 'positive' | 'negative' | 'neutral';

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];
export const TASK_PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];

export interface Assignee {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  // Not trusted from the API: we always calculate it ourselves (see date.utils.ts)
  isOverdue?: boolean;
  completedAt?: string;
  assignee: Assignee;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/** The values the task form sends when creating or editing a task. */
export interface TaskFormValue {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string;
  tags: string[];
}

export interface Statistic {
  id: string;
  title: string;
  icon: string;
  value: number;
  change: string;
  changeLabel: string;
  changeType: ChangeType;
  color: string;
}

export interface TasksResponse {
  tasks: Task[];
  meta: {
    totalCount: number;
    lastUpdated: string;
  };
}
export interface StatisticsResponse {
  statistics: Statistic[];
  lastUpdated: string;
}

export type ActivityType = 'created' | 'updated' | 'completed' | 'deleted' | 'moved';

export interface Activity {
  id: string;
  type: ActivityType;
  taskTitle: string;
  userName: string;
  date: string;
}

export type StatusFilter = TaskStatus | 'all';
export type PriorityFilter = TaskPriority | 'all';
