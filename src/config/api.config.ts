export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/v1'
  : '/api/v1';

export const API_ENDPOINTS = {
  // Requests endpoints
  requests: {
    execute: '/requests/execute',
  },
  
  // AI endpoints
  ai: {
    description: '/ai/description',
    documentation: '/ai/documentation',
    analyze: '/ai/analyze',
  },
} as const;

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const; 