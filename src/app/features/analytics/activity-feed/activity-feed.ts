import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Activity, ActivityType } from '../../../core/models/task.model';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

/** Presentational: list of recent changes. */
@Component({
  selector: 'app-activity-feed',
  imports: [TranslatePipe, TimeAgoPipe],
  templateUrl: './activity-feed.html',
  styleUrl: './activity-feed.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFeed {
  readonly activities = input.required<Activity[]>();
  readonly lang = input('en');

  protected readonly icons: Record<ActivityType, string> = {
    created: '🆕',
    updated: '✏️',
    moved: '🔄',
    completed: '✅',
    deleted: '🗑️',
  };
}
