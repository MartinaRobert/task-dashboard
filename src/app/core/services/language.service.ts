import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'en' | 'ar';

const STORAGE_KEY = 'language';

/** Switches the app language and sets the page direction (RTL for Arabic). */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  readonly current = signal<Language>('en');
  readonly direction = computed(() => (this.current() === 'ar' ? 'rtl' : 'ltr'));

  init(): void {
    this.use(this.readSaved());
  }

  toggle(): void {
    this.use(this.current() === 'en' ? 'ar' : 'en');
  }

  use(lang: Language): void {
    this.current.set(lang);
    this.translate.use(lang);
    this.document.documentElement.lang = lang;
    this.document.documentElement.dir = this.direction();
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage can be blocked (private mode); the language still works for this visit
    }
  }

  private readSaved(): Language {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  }
}
