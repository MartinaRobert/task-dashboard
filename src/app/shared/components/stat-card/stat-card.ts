import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { StatCard as StatCardModel } from '../../../core/services/task-store';

/** Presentational: one statistic box (Total, Completed, In Progress, Overdue). */
@Component({
  selector: 'app-stat-card',
  imports: [TranslatePipe],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  readonly stat = input.required<StatCardModel>();
}
