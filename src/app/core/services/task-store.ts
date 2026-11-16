import { httpResource } from '@angular/common/http';
import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { API_URLS, TaskApiService } from '../api/task-api.service';
import {
  Activity,
  ActivityType,
  Assignee,
  PriorityFilter,
  Statistic,
  StatusFilter,
  Task,
  TASK_STATUSES,
  TaskFormValue,
  TaskStatus,
} from '../models/task.model';
import { isTaskOverdue } from '../utils/date.utils';
import { NotificationService } from './notification.service';

export interface StatCard {
  id: string;
  titleKey: string;
  icon: string;
  value: number;
  change: string;
  changeLabelKey: string;
  changeType: Statistic['changeType'];
}

export interface TaskColumn {
  status: TaskStatus;
  tasks: Task[];
}

// Errors are already shown to the user by errorInterceptor, so here we only stop them from bubbling up
const SHOWN_BY_INTERCEPTOR = () => undefined;

// The statistics API sends English labels, so we map them to translation keys
const CHANGE_LABEL_KEYS: Record<string, string> = {
  'this week': 'stats.thisWeek',
  today: 'stats.today',
  'Same as yesterday': 'stats.sameAsYesterday',
};

/**
 * The single place that holds task state.
 * Components read signals from here and call methods to change data.
 */
@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly api = inject(TaskApiService);
  private readonly notification = inject(NotificationService);

  // --- Server data (read with httpResource) ---
  readonly tasksResource = httpResource<Task[]>(() => API_URLS.tasks);
  readonly usersResource = httpResource<Assignee[]>(() => API_URLS.users);
  readonly statisticsResource = httpResource<Statistic[]>(() => API_URLS.statistics);

  /** Local copy of the tasks. It resets when the server data changes and we edit it after each save. */
  readonly tasks = linkedSignal<Task[]>(() => {
    const tasks = this.tasksResource.hasValue() ? this.tasksResource.value() : [];
    return tasks.map((task) => ({ ...task, isOverdue: isTaskOverdue(task) }));
  });

  readonly users = computed(() =>
    this.usersResource.hasValue() ? this.usersResource.value() : [],
  );
  readonly isLoading = computed(() => this.tasksResource.isLoading());
  readonly hasError = computed(() => !!this.tasksResource.error());

  // --- Filters ---
  readonly statusFilter = signal<StatusFilter>('all');
  readonly priorityFilter = signal<PriorityFilter>('all');
  readonly assigneeFilter = signal<string>('all');
  readonly searchQuery = signal('');

  /** Tasks after applying status, priority, assignee and search filters. */
  readonly filteredTasks = computed(() => {
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const assignee = this.assigneeFilter();
    const query = this.searchQuery().trim().toLowerCase();

    return this.tasks().filter(
      (task) =>
        (status === 'all' || task.status === status) &&
        (priority === 'all' || task.priority === priority) &&
        (assignee === 'all' || task.assignee.id === assignee) &&
        (!query ||
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)),
    );
  });

  /** Filtered tasks grouped by status for the board. */
  readonly columns = computed<TaskColumn[]>(() => {
    const status = this.statusFilter();
    const visible = status === 'all' ? TASK_STATUSES : [status];
    return visible.map((s) => ({
      status: s,
      tasks: this.filteredTasks().filter((task) => task.status === s),
    }));
  });

  /** Card values come from the live tasks, so they update after every change. */
  readonly stats = computed<StatCard[]>(() => {
    const tasks = this.tasks();
    const apiStats = this.statisticsResource.hasValue() ? this.statisticsResource.value() : [];
    const values = [
      { id: 'stat-001', titleKey: 'stats.total', icon: '📊', value: tasks.length },
      {
        id: 'stat-002',
        titleKey: 'stats.completed',
        icon: '✅',
        value: tasks.filter((t) => t.status === 'done').length,
      },
      {
        id: 'stat-003',
        titleKey: 'stats.inProgress',
        icon: '🔄',
        value: tasks.filter((t) => t.status === 'in_progress').length,
      },
      {
        id: 'stat-004',
        titleKey: 'stats.overdue',
        icon: '⚠️',
        value: tasks.filter((t) => t.isOverdue).length,
      },
    ];

    return values.map((item) => {
      const apiStat = apiStats.find((s) => s.id === item.id);
      return {
        ...item,
        change: apiStat?.change ?? '',
        changeLabelKey: apiStat
          ? (CHANGE_LABEL_KEYS[apiStat.changeLabel] ?? apiStat.changeLabel)
          : '',
        changeType: apiStat?.changeType ?? 'neutral',
      };
    });
  });

  // --- Activity feed ---
  private readonly liveActivities = signal<Activity[]>([]);

  /** Starting history built from the dates in the server data. */
  private readonly seedActivities = computed<Activity[]>(() => {
    const tasks = this.tasksResource.hasValue() ? this.tasksResource.value() : [];
    return tasks.flatMap((task) => {
      const created = createActivity('created', task, task.createdAt);
      return task.completedAt
        ? [created, createActivity('completed', task, task.completedAt)]
        : [created];
    });
  });

  /** The 8 most recent activities, newest first. */
  readonly activities = computed(() =>
    [...this.liveActivities(), ...this.seedActivities()]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8),
  );

  reload(): void {
    this.tasksResource.reload();
  }

  resetFilters(): void {
    this.statusFilter.set('all');
    this.priorityFilter.set('all');
    this.assigneeFilter.set('all');
    this.searchQuery.set('');
  }

  // --- Write actions ---

  create(value: TaskFormValue): void {
    const now = new Date().toISOString();
    const newTask: Omit<Task, 'id'> = {
      ...this.fromForm(value),
      createdAt: now,
      updatedAt: now,
      completedAt: value.status === 'done' ? now : undefined,
    };

    this.api.create(newTask).subscribe({
      next: (created) => {
        this.tasks.update((tasks) => [withOverdue(created), ...tasks]);
        this.addActivity('created', created);
        this.notification.success('messages.created');
      },
      error: SHOWN_BY_INTERCEPTOR,
    });
  }

  update(task: Task, value: TaskFormValue): void {
    this.save({ ...task, ...this.fromForm(value) }, task.status);
  }

  changeStatus(task: Task, status: TaskStatus): void {
    if (task.status !== status) {
      this.save({ ...task, status }, task.status);
    }
  }

  delete(task: Task): void {
    this.api.delete(task.id).subscribe({
      next: () => {
        this.tasks.update((tasks) => tasks.filter((t) => t.id !== task.id));
        this.addActivity('deleted', task);
        this.notification.success('messages.deleted');
      },
      error: SHOWN_BY_INTERCEPTOR,
    });
  }

  private save(changed: Task, previousStatus: TaskStatus): void {
    const now = new Date().toISOString();
    const updated = withOverdue({
      ...changed,
      updatedAt: now,
      completedAt: changed.status === 'done' ? (changed.completedAt ?? now) : undefined,
    });

    this.api.update(updated).subscribe({
      next: () => {
        this.tasks.update((tasks) => tasks.map((t) => (t.id === updated.id ? updated : t)));
        this.addActivity(getActivityType(previousStatus, updated.status), updated);
        this.notification.success('messages.updated');
      },
      error: SHOWN_BY_INTERCEPTOR,
    });
  }

  /** Converts form values into task fields (the form only has the assignee id). */
  private fromForm(value: TaskFormValue): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
    const { assigneeId, ...fields } = value;
    const assignee = this.users().find((user) => user.id === assigneeId);
    if (!assignee) {
      throw new Error(`Unknown assignee: ${assigneeId}`);
    }
    return { ...fields, assignee };
  }

  private addActivity(type: ActivityType, task: Task): void {
    const activity = createActivity(type, task, new Date().toISOString());
    this.liveActivities.update((list) => [activity, ...list]);
  }
}

function withOverdue(task: Task): Task {
  return { ...task, isOverdue: isTaskOverdue(task) };
}

function getActivityType(previous: TaskStatus, next: TaskStatus): ActivityType {
  if (previous === next) return 'updated';
  return next === 'done' ? 'completed' : 'moved';
}

let activityCounter = 0;

function createActivity(type: ActivityType, task: Task, date: string): Activity {
  activityCounter++;
  return {
    id: `${type}-${task.id}-${activityCounter}`,
    type,
    taskTitle: task.title,
    userName: task.assignee.name,
    date,
  };
}
