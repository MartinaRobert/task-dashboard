import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestDeps, USERS } from '../../../../testing/test-helpers';
import { FilterBar } from './filter-bar';

describe('FilterBar', () => {
  let fixture: ComponentFixture<FilterBar>;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FilterBar], providers: provideTestDeps() });
    fixture = TestBed.createComponent(FilterBar);
    fixture.componentRef.setInput('users', USERS);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('marks the active status tab and updates it on click', () => {
    const tabs = el.querySelectorAll<HTMLButtonElement>('.filters__tab');
    expect(tabs.length).toBe(4);
    expect(tabs[0].getAttribute('aria-pressed')).toBe('true');

    tabs[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.status()).toBe('in_progress');
    expect(tabs[2].classList).toContain('filters__tab--active');
  });

  async function pickOption(selectIndex: number, optionIndex: number) {
    el.querySelectorAll<HTMLElement>('.mat-mdc-select-trigger')[selectIndex].click();
    fixture.detectChanges();
    await fixture.whenStable();
    const panels = document.querySelectorAll('.mat-mdc-select-panel');
    const lastPanel = panels[panels.length - 1];
    lastPanel.querySelectorAll<HTMLElement>('mat-option')[optionIndex].click();
  }

  it('updates assignee and priority from the dropdowns', async () => {
    await pickOption(0, 1);
    expect(fixture.componentInstance.assignee()).toBe('user-001');

    await pickOption(1, 1);
    expect(fixture.componentInstance.priority()).toBe('high');
  });

  it('emits newTask', () => {
    let clicked = false;
    fixture.componentInstance.newTask.subscribe(() => (clicked = true));
    el.querySelector<HTMLButtonElement>('.filters__actions > button')?.click();
    expect(clicked).toBe(true);
  });
});
