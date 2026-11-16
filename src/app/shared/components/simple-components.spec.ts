import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideTestDeps } from '../../../testing/test-helpers';
import { StatCard as StatCardModel } from '../../core/services/task-store';
import { ConfirmDialog } from './confirm-dialog/confirm-dialog';
import { ErrorState } from './error-state/error-state';
import { Skeleton } from './skeleton/skeleton';
import { StatCard } from './stat-card/stat-card';

describe('small shared components', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: provideTestDeps() }));

  it('StatCard shows value and change', () => {
    const fixture = TestBed.createComponent(StatCard);
    const stat: StatCardModel = {
      id: 's',
      titleKey: 'stats.total',
      icon: '📊',
      value: 7,
      change: '+2',
      changeLabelKey: 'stats.today',
      changeType: 'positive',
    };
    fixture.componentRef.setInput('stat', stat);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.stat__value')?.textContent).toContain('7');
    expect(el.querySelector('.stat__change--positive')?.textContent).toContain('+2');

    fixture.componentRef.setInput('stat', { ...stat, change: '0', changeLabelKey: '' });
    fixture.detectChanges();
    expect(el.querySelector('.stat__change')).toBeNull();
  });

  it('ErrorState emits retry', () => {
    const fixture = TestBed.createComponent(ErrorState);
    fixture.detectChanges();
    let retried = false;
    fixture.componentInstance.retry.subscribe(() => (retried = true));
    fixture.nativeElement.querySelector('button').click();
    expect(retried).toBe(true);
    expect(fixture.nativeElement.querySelector('[role=alert]')).not.toBeNull();
  });

  it('Skeleton uses the given height', () => {
    const fixture = TestBed.createComponent(Skeleton);
    fixture.componentRef.setInput('height', '40px');
    fixture.detectChanges();
    expect(fixture.nativeElement.style.height).toBe('40px');
    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });

  it('ConfirmDialog shows the message keys', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, {
      useValue: { titleKey: 'dialog.deleteTitle', messageKey: 'dialog.deleteMessage' },
    });
    const fixture = TestBed.createComponent(ConfirmDialog);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('dialog.deleteTitle');
    expect(fixture.nativeElement.textContent).toContain('dialog.deleteMessage');
  });
});
