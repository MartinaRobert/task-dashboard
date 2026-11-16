import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideTranslateService } from '@ngx-translate/core';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  const snackBar = { open: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTranslateService(), { provide: MatSnackBar, useValue: snackBar }],
    });
  });

  it('opens a translated snackbar with the right style', () => {
    const service = TestBed.inject(NotificationService);
    service.success('messages.created');
    service.error('errors.server');

    expect(snackBar.open).toHaveBeenCalledWith('messages.created', 'common.close', {
      duration: 3000,
      panelClass: 'snackbar-success',
    });
    expect(snackBar.open).toHaveBeenLastCalledWith(
      'errors.server',
      'common.close',
      expect.objectContaining({ panelClass: 'snackbar-error' }),
    );
  });
});
