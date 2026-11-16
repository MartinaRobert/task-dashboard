import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

interface NavItem {
  path: string;
  icon: string;
  labelKey: string;
}

/** Presentational: shows the navigation links and tells the parent when "New Task" is clicked. */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatButtonModule, TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  readonly navigate = output<void>();
  readonly newTask = output<void>();

  protected readonly items: NavItem[] = [
    { path: '/dashboard', icon: '📊', labelKey: 'nav.dashboard' },
    { path: '/tasks', icon: '✅', labelKey: 'nav.tasks' },
    { path: '/calendar', icon: '📅', labelKey: 'nav.calendar' },
    { path: '/analytics', icon: '📈', labelKey: 'nav.analytics' },
    { path: '/team', icon: '👥', labelKey: 'nav.team' },
    { path: '/settings', icon: '⚙️', labelKey: 'nav.settings' },
  ];
}
