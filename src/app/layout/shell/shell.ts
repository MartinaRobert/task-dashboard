import { BreakpointObserver } from '@angular/cdk/layout';
import { Dir } from '@angular/cdk/bidi';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';
import { TaskDialogService } from '../../shared/services/task-dialog.service';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

/** Main layout: header on top, sidebar on the side, the current page in the middle. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, MatSidenavModule, Dir, Header, Sidebar, TranslatePipe],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly taskDialog = inject(TaskDialogService);
  protected readonly language = inject(LanguageService);

  // true on phones and small tablets: the sidebar becomes a slide-in menu
  protected readonly isMobile = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 959.98px)')
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  protected openNewTask(): void {
    this.taskDialog.openCreate();
  }
}
