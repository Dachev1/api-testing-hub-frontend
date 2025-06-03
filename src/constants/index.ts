import type { HttpMethod } from '@/types';

// HTTP Methods
export const HTTP_METHODS: HttpMethod[] = [
  { value: 'GET', label: 'GET', color: 'text-emerald-600 font-semibold' },
  { value: 'POST', label: 'POST', color: 'text-blue-600 font-semibold' },
  { value: 'PUT', label: 'PUT', color: 'text-amber-600 font-semibold' },
  { value: 'DELETE', label: 'DELETE', color: 'text-rose-600 font-semibold' },
  { value: 'PATCH', label: 'PATCH', color: 'text-violet-600 font-semibold' },
  { value: 'HEAD', label: 'HEAD', color: 'text-slate-600 font-semibold' },
  { value: 'OPTIONS', label: 'OPTIONS', color: 'text-pink-600 font-semibold' },
];

// Method Colors
export const METHOD_COLORS: Record<string, string> = {
  GET: 'text-emerald-600',
  POST: 'text-blue-600',
  PUT: 'text-amber-600',
  DELETE: 'text-rose-600',
  PATCH: 'text-violet-600',
  HEAD: 'text-slate-600',
  OPTIONS: 'text-pink-600',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  COLLECTIONS: 'api-testing-hub-collections',
  HISTORY: 'api-testing-hub-history',
  THEME: 'api-testing-hub-theme',
  ENVIRONMENT: 'api-testing-hub-environment',
} as const;

// Default Values
export const DEFAULT_VALUES = {
  REQUEST_TIMEOUT: 30000,
  MAX_HISTORY_ITEMS: 100,
  MAX_COLLECTION_SIZE: 50,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

// API Configuration
export const API_CONFIG = {
  DEFAULT_TIMEOUT: 30000,
  MAX_RESPONSE_SIZE: 10 * 1024 * 1024, // 10MB
  DEFAULT_CONTENT_TYPE: 'application/json',
} as const; 