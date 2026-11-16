import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { flushInitialData, provideTestDeps } from '../../testing/test-helpers';
import { App } from '../app';
import { LanguageService } from '../core/services/language.service';
import { TaskStore } from '../core/services/task-store';
import { TaskDialogService } from '../shared/services/task-dialog.service';
import { Header, SEARCH_DEBOUNCE_MS } from './header/header';
import { Sidebar } from './sidebar/sidebar';

describe('layout', () => {
  const dialogs = { openCreate: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...provideTestDeps(),
        provideRouter([{ path: '**', children: [] }]),
        { provide: TaskDialogService, useValue: dialogs },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

  it('App renders the shell with header, sidebar and outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-header')).not.toBeNull();
    expect(el.querySelector('app-sidebar')).not.toBeNull();
    expect(el.querySelector('router-outlet')).not.toBeNull();

    el.querySelector<HTMLButtonElement>('.sidebar__new')?.click();
    expect(dialogs.openCreate).toHaveBeenCalled();
  });

  it('Header updates the search filter after the user stops typing', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type=search]');
    input.value = 'login';
    input.dispatchEvent(new Event('input'));

    const store = TestBed.inject(TaskStore);
    expect(store.searchQuery()).toBe('');
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    expect(store.searchQuery()).toBe('login');
  });

  it('Header shows the menu button on mobile and switches language', async () => {
    const fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('showMenuButton', true);
    fixture.detectChanges();
    let toggled = false;
    fixture.componentInstance.menuToggle.subscribe(() => (toggled = true));

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    expect(toggled).toBe(true);

    fixture.nativeElement.querySelector('.header__lang').click();
    expect(TestBed.inject(LanguageService).current()).toBe('ar');
    TestBed.inject(LanguageService).use('en');

    await flushInitialData();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('JD');
  });

  it('Sidebar renders the navigation and emits events', () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(6);

    let navigated = false;
    fixture.componentInstance.navigate.subscribe(() => (navigated = true));
    links[1].click();
    expect(navigated).toBe(true);
  });
});
