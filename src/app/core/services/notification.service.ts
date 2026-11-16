import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

/** Small wrapper around the Material snackbar that translates messages. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  success(key: string): void {
    this.open(key, 'snackbar-success');
  }

  error(key: string): void {
    this.open(key, 'snackbar-error');
  }

  private open(key: string, panelClass: string): void {
    const message = this.translate.instant(key);
    const close = this.translate.instant('common.close');
    this.snackBar.open(message, close, { duration: 3000, panelClass });
  }
}
