import React from 'react';
import type { BaseComponentProps } from '.';

export interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  description?: string;
} 