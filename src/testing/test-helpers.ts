import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, EnvironmentProviders, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { API_URLS } from '../app/core/api/task-api.service';
import { Assignee, Statistic, Task } from '../app/core/models/task.model';
import { toDateString } from '../app/core/utils/date.utils';

/** Common providers for component and service tests. Translations return their keys. */
export function provideTestDeps(): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(),
    provideHttpClientTesting(),
    provideTranslateService(),
    provideRouter([]),
    provideNativeDateAdapter(),
  ];
}

function daysFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

export const USERS: Assignee[] = [
  { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john@test.com' },
  { id: 'user-002', name: 'Sarah Smith', avatar: 'SS', email: 'sarah@test.com' },
];

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-001',
    title: 'Design homepage',
    description: 'Create wireframes',
    status: 'todo',
    priority: 'high',
    dueDate: daysFromToday(2),
    assignee: USERS[0],
    tags: ['Design'],
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export const TASKS: Task[] = [
  makeTask(),
  makeTask({
    id: 'task-002',
    title: 'Fix login bug',
    description: 'Mobile login issue',
    status: 'in_progress',
    priority: 'medium',
    dueDate: daysFromToday(-1),
    assignee: USERS[1],
    tags: ['Bug'],
  }),
  makeTask({
    id: 'task-003',
    title: 'Write tests',
    description: 'Unit tests for auth',
    status: 'done',
    priority: 'low',
    dueDate: daysFromToday(-3),
    completedAt: new Date().toISOString(),
    tags: [],
  }),
];

export const STATISTICS: Statistic[] = [
  {
    id: 'stat-001',
    title: 'Total Tasks',
    icon: '📊',
    value: 156,
    change: '+12',
    changeLabel: 'this week',
    changeType: 'positive',
    color: '#1976D2',
  },
  {
    id: 'stat-003',
    title: 'In Progress',
    icon: '🔄',
    value: 42,
    change: '0',
    changeLabel: 'Something new',
    changeType: 'neutral',
    color: '#FF6F00',
  },
];

/** Waits until httpResource has processed the flushed responses. */
export async function settle(): Promise<void> {
  TestBed.tick();
  await TestBed.inject(ApplicationRef).whenStable();
}

/** Answers the three GET requests the TaskStore makes on start. */
export async function flushInitialData(
  tasks: Task[] = TASKS,
  users: Assignee[] = USERS,
  statistics: Statistic[] = STATISTICS,
): Promise<void> {
  const http = TestBed.inject(HttpTestingController);
  TestBed.tick();
  http.match(API_URLS.tasks).forEach((req) => req.flush(structuredClone(tasks)));
  http.match(API_URLS.users).forEach((req) => req.flush(structuredClone(users)));
  http.match(API_URLS.statistics).forEach((req) => req.flush(structuredClone(statistics)));
  await settle();
}
