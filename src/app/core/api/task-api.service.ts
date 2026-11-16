import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

export const API_URLS = {
  tasks: 'api/tasks',
  users: 'api/users',
  statistics: 'api/statistics',
} as const;

/**
 * Write requests (create, update, delete).
 * Reads are done with `httpResource` inside TaskStore.
 */
@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);

  create(task: Omit<Task, 'id'>): Observable<Task> {
    return this.http.post<Task>(API_URLS.tasks, task);
  }

  update(task: Task): Observable<unknown> {
    return this.http.put(`${API_URLS.tasks}/${task.id}`, task);
  }

  delete(id: string): Observable<unknown> {
    return this.http.delete(`${API_URLS.tasks}/${id}`);
  }
}
