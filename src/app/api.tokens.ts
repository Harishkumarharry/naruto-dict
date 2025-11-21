import { InjectionToken } from '@angular/core';

// Injection tokens for configuring the API URL and optional headers
export const API_URL = new InjectionToken<string>('API_URL');
export const API_HEADERS = new InjectionToken<Record<string, string> | null>('API_HEADERS');
