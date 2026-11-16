import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';
import { TaskStore } from '../../core/services/task-store';

export const SEARCH_DEBOUNCE_MS = 250;

@Component({
  selector: 'app-header',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly store = inject(TaskStore);
  protected readonly language = inject(LanguageService);

  readonly showMenuButton = input(false);
  readonly menuToggle = output<void>();

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly overdueCount = computed(
    () => this.store.tasks().filter((t) => t.isOverdue).length,
  );

  constructor() {
    // Wait until the user stops typing, then update the search filter.
    // takeUntilDestroyed() unsubscribes automatically, so there is no memory leak.
    this.searchControl.valueChanges
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((query) => this.store.searchQuery.set(query));
  }
}
