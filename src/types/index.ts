export * from './api.types';
export * from './ui.types';

import type { RequestHeader } from './api.types';

export interface HttpMethod {
  value: string;
  label: string;
  color?: string;
}

export interface UIStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
} 