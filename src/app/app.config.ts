import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { routes } from './app.routes';
import { InMemoryDataService } from './core/api/in-memory-data.service';
import { JsonTranslateLoader } from './core/i18n/json-translate-loader';
import { cacheInterceptor } from './core/interceptors/cache.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { retryInterceptor } from './core/interceptors/retry.interceptor';
import { LanguageService } from './core/services/language.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    // Order matters: errors are shown once, after the cache and the retries
    provideHttpClient(
      withFetch(),
      withInterceptors([errorInterceptor, cacheInterceptor, retryInterceptor]),
    ),
    importProvidersFrom(
      HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, { delay: 600 }),
    ),
    provideTranslateService({
      loader: provideTranslateLoader(JsonTranslateLoader),
      fallbackLang: 'en',
    }),
    provideAppInitializer(() => inject(LanguageService).init()),
    provideNativeDateAdapter(),
  ],
};
