import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo, ResponseOptions } from 'angular-in-memory-web-api';
import statisticsJson from '../../../../data-fetching/statistics.json';
import tasksJson from '../../../../data-fetching/tasks.json';
import { Assignee, Statistic, StatisticsResponse, Task, TasksResponse } from '../models/task.model';
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

  /**
   * Wraps list responses
   * `GET api/tasks` → `{ tasks, meta }` and `GET api/statistics` → `{ statistics, lastUpdated }`.
   * (The library returns plain arrays by default.)
   */
  responseInterceptor(res: ResponseOptions, reqInfo: RequestInfo): ResponseOptions {
    const isListRequest = reqInfo.method === 'get' && !reqInfo.id;
    if (!isListRequest) return res;

    const lastUpdated = new Date().toISOString();
    if (reqInfo.collectionName === 'tasks') {
      const tasks = res.body as Task[];
      const body: TasksResponse = { tasks, meta: { totalCount: tasks.length, lastUpdated } };
      res.body = body;
    }
    if (reqInfo.collectionName === 'statistics') {
      const body: StatisticsResponse = { statistics: res.body as Statistic[], lastUpdated };
      res.body = body;
    }
    return res;
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
