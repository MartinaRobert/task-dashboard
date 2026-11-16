import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../core/models/task.model';
import { LanguageService } from '../../core/services/language.service';
import { TaskStore } from '../../core/services/task-store';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { ActivityFeed } from './activity-feed/activity-feed';
import { ChartSlice, TaskChart } from './task-chart/task-chart';

const PRIORITY_COLORS = { high: '#D32F2F', medium: '#FF6F00', low: '#388E3C' };
const STATUS_COLORS = { todo: '#1976D2', in_progress: '#FF6F00', done: '#388E3C' };

const LABEL_KEYS = [
  ...TASK_PRIORITIES.map((p) => `priority.${p}`),
  ...TASK_STATUSES.map((s) => `status.${s}`),
  'analytics.byPriority',
  'analytics.byStatus',
];

/** Smart page: charts by priority and status, plus the recent activity feed. */
@Component({
  selector: 'app-analytics-page',
  imports: [TaskChart, ActivityFeed, Skeleton, ErrorState, TranslatePipe],
  templateUrl: './analytics-page.html',
  styleUrl: './analytics-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPage {
  protected readonly store = inject(TaskStore);
  protected readonly language = inject(LanguageService);

  // stream() emits again every time the language changes, so chart labels stay translated
  protected readonly labels = toSignal(inject(TranslateService).stream(LABEL_KEYS), {
    initialValue: {} as Record<string, string>,
  });

  protected readonly prioritySlices = computed<ChartSlice[]>(() =>
    TASK_PRIORITIES.map((priority) => ({
      label: this.labels()[`priority.${priority}`] ?? priority,
      value: this.store.tasks().filter((t) => t.priority === priority).length,
      color: PRIORITY_COLORS[priority],
    })),
  );

  protected readonly statusSlices = computed<ChartSlice[]>(() =>
    TASK_STATUSES.map((status) => ({
      label: this.labels()[`status.${status}`] ?? status,
      value: this.store.tasks().filter((t) => t.status === status).length,
      color: STATUS_COLORS[status],
    })),
  );
}
