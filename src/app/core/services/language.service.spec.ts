import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { JsonTranslateLoader } from '../i18n/json-translate-loader';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
    service = TestBed.inject(LanguageService);
  });

  it('starts in English by default', () => {
    service.init();
    expect(service.current()).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('restores the saved language', () => {
    localStorage.setItem('language', 'ar');
    service.init();
    expect(service.current()).toBe('ar');
  });

  it('toggles to Arabic with right-to-left direction and saves it', () => {
    const translate = TestBed.inject(TranslateService);
    const use = vi.spyOn(translate, 'use');
    service.toggle();

    expect(service.current()).toBe('ar');
    expect(service.direction()).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
    expect(localStorage.getItem('language')).toBe('ar');
    expect(use).toHaveBeenCalledWith('ar');

    service.toggle();
    expect(service.current()).toBe('en');
  });

  it('still works when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => service.init()).not.toThrow();
    expect(service.current()).toBe('en');
    vi.restoreAllMocks();
  });
});

describe('JsonTranslateLoader', () => {
  const loader = new JsonTranslateLoader();

  it('loads the requested language file', async () => {
    const ar = await firstValueFrom(loader.getTranslation('ar'));
    expect((ar['app'] as Record<string, string>)['title']).toBe('مدير المهام');
  });

  it('falls back to English for unknown languages', async () => {
    const file = await firstValueFrom(loader.getTranslation('fr'));
    expect((file['app'] as Record<string, string>)['title']).toBe('Task Manager');
  });
});
