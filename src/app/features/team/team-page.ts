import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Assignee } from '../../core/models/task.model';
import { TaskStore } from '../../core/services/task-store';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { Skeleton } from '../../shared/components/skeleton/skeleton';

interface TeamMember extends Assignee {
  open: number;
  done: number;
  overdue: number;
}

/** Smart page: the user list (mocked, built from task assignees) with task counts. */
@Component({
  selector: 'app-team-page',
  imports: [MatButtonModule, Skeleton, ErrorState, TranslatePipe],
  templateUrl: './team-page.html',
  styleUrl: './team-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPage {
  protected readonly store = inject(TaskStore);
  private readonly router = inject(Router);

  protected readonly skeletons = [1, 2, 3, 4];

  protected readonly members = computed<TeamMember[]>(() =>
    this.store.users().map((user) => {
      const tasks = this.store.tasks().filter((t) => t.assignee.id === user.id);
      return {
        ...user,
        open: tasks.filter((t) => t.status !== 'done').length,
        done: tasks.filter((t) => t.status === 'done').length,
        overdue: tasks.filter((t) => t.isOverdue).length,
      };
    }),
  );

  protected viewTasks(userId: string): void {
    this.store.resetFilters();
    this.store.assigneeFilter.set(userId);
    this.router.navigate(['/dashboard']);
  }
}
