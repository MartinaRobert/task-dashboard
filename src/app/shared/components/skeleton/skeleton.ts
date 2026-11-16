import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Grey shimmering block shown while data is loading. */
@Component({
  selector: 'app-skeleton',
  template: '',
  host: {
    class: 'skeleton',
    'aria-hidden': 'true',
    '[style.height]': 'height()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skeleton {
  readonly height = input('16px');
}
