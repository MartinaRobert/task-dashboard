import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { flushInitialData, provideTestDeps, settle } from '../../../testing/test-helpers';
import { API_URLS } from '../../core/api/task-api.service';
import { TaskStore } from '../../core/services/task-store';
import { TaskDialogService } from '../../shared/services/task-dialog.service';
import { DashboardPage } from './dashboard-page';

describe('DashboardPage (integration with TaskStore)', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let el: HTMLElement;
  const dialogs = { openCreate: vi.fn(), openEdit: vi.fn(), confirmDelete: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [...provideTestDeps(), { provide: TaskDialogService, useValue: dialogs }],
    });
    fixture = TestBed.createComponent(DashboardPage);
    el = fixture.nativeElement;
  });

  it('shows skeletons while loading, then stats and the board', async () => {
    fixture.detectChanges();
    expect(el.querySelectorAll('app-skeleton').length).toBeGreaterThan(0);

    await flushInitialData();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-stat-card').length).toBe(4);
    expect(el.querySelectorAll('app-task-card').length).toBe(3);
  });

  it('filters the board from the status tabs', async () => {
    fixture.detectChanges();
    await flushInitialData();
    fixture.detectChanges();

    el.querySelectorAll<HTMLButtonElement>('.filters__tab')[3].click();
    fixture.detectChanges();
    expect(el.querySelectorAll('.column').length).toBe(1);
    expect(TestBed.inject(TaskStore).statusFilter()).toBe('done');
  });

  it('opens the create dialog', async () => {
    fixture.detectChanges();
    await flushInitialData();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('.filters__actions > button')?.click();
    expect(dialogs.openCreate).toHaveBeenCalled();
  });

  it('changes status from a card menu', async () => {
    fixture.detectChanges();
    await flushInitialData();
    fixture.detectChanges();
    const store = TestBed.inject(TaskStore);
    const spy = vi.spyOn(store, 'changeStatus');
    const task = store.tasks()[0];
    fixture.componentInstance['onStatusChange']({ task, status: 'done' });
    expect(spy).toHaveBeenCalledWith(task, 'done');
    TestBed.inject(HttpTestingController).expectOne(`${API_URLS.tasks}/${task.id}`).flush(null);
  });

  it('shows the error state and retries', async () => {
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    TestBed.tick();
    http.expectOne(API_URLS.tasks).flush(null, { status: 404, statusText: 'Not Found' });
    http.match(() => true).forEach((r) => r.flush([]));
    await settle();
    fixture.detectChanges();
    expect(el.querySelector('app-error-state')).not.toBeNull();

    el.querySelector<HTMLButtonElement>('app-error-state button')?.click();
    TestBed.tick();
    http.expectOne(API_URLS.tasks).flush([]);
  });
});
