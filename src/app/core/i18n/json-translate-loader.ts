import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { from, map, Observable } from 'rxjs';

// Each language file is loaded lazily, so it becomes its own small bundle
const LANGUAGE_FILES: Record<string, () => Promise<{ default: TranslationObject }>> = {
  en: () => import('./en.json'),
  ar: () => import('./ar.json'),
};

/** Loads translation files with dynamic imports instead of HTTP (no extra request through the fake API). */
export class JsonTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    const load = LANGUAGE_FILES[lang] ?? LANGUAGE_FILES['en'];
    return from(load()).pipe(map((file) => file.default));
  }
}
