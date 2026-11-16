import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import statisticsJson from '../../../../data-fetching/statistics.json';
import tasksJson from '../../../../data-fetching/tasks.json';
import { Assignee, Statistic, Task } from '../models/task.model';

/**
 * Fake backend. It reads the generated JSON files and serves them under `api/`.
 * Supports GET, POST, PUT and DELETE like a real REST API.
 */
@Injectable({ providedIn: 'root' })
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const tasks = structuredClone(tasksJson.tasks) as Task[];
    const statistics = structuredClone(statisticsJson.statistics) as Statistic[];
    return { tasks, users: getUniqueUsers(tasks), statistics };
  }

  /** Creates ids like `task-018` for new items. */
  genId(items: { id: string }[], collectionName: string): string {
    const numbers = items.map((item) => Number(item.id.split('-').pop()) || 0);
    const next = Math.max(0, ...numbers) + 1;
    return `${collectionName.replace(/s$/, '')}-${String(next).padStart(3, '0')}`;
  }
}

/** The data has no users endpoint, so we build the user list from task assignees. */
export function getUniqueUsers(tasks: Task[]): Assignee[] {
  const users = new Map<string, Assignee>();
  tasks.forEach((task) => users.set(task.assignee.id, task.assignee));
  return [...users.values()].sort((a, b) => a.name.localeCompare(b.name));
}
