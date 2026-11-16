import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/** Placeholder for pages in the design that are outside the assignment scope. */
@Component({
  selector: 'app-coming-soon-page',
  imports: [TranslatePipe],
  template: `
    <h1 class="page-title">{{ titleKey() | translate }}</h1>
    <p class="panel">{{ 'common.comingSoon' | translate }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComingSoonPage {
  // Filled from the route `data` thanks to withComponentInputBinding()
  readonly titleKey = input('');
}
