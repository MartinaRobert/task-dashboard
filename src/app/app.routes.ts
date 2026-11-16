import { Routes } from '@angular/router';

// Every page is lazy loaded, so it is only downloaded when the user opens it
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () => import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'tasks',
    title: 'Tasks',
    loadComponent: () => import('./features/tasks/tasks-page').then((m) => m.TasksPage),
  },
  {
    path: 'analytics',
    title: 'Analytics',
    loadComponent: () => import('./features/analytics/analytics-page').then((m) => m.AnalyticsPage),
  },
  {
    path: 'team',
    title: 'Team',
    loadComponent: () => import('./features/team/team-page').then((m) => m.TeamPage),
  },
  {
    path: 'calendar',
    title: 'Calendar',
    data: { titleKey: 'nav.calendar' },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon-page').then((m) => m.ComingSoonPage),
  },
  {
    path: 'settings',
    title: 'Settings',
    data: { titleKey: 'nav.settings' },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon-page').then((m) => m.ComingSoonPage),
  },
  { path: '**', redirectTo: 'dashboard' },
];
