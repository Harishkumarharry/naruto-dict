import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { API_URL, API_HEADERS } from './api.tokens';

// Default API URL; replace with your real endpoint or override value here
const DEFAULT_API_URL = 'https://dattebayo-api.onrender.com';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: API_URL, useValue: DEFAULT_API_URL },
    { provide: API_HEADERS, useValue: null },
  ],
};
