import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

/** Shown when loading fails, with a button to try again. */
@Component({
  selector: 'app-error-state',
  imports: [MatButtonModule, TranslatePipe],
  templateUrl: './error-state.html',
  styleUrl: './error-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorState {
  readonly retry = output<void>();
}
