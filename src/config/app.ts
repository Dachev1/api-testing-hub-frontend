export const APP_CONFIG = {
  name: 'API Testing Hub',
  version: '1.0.0',
  description: 'Professional API Development Tool',
  author: 'API Testing Hub Team',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API Settings
  api: {
    timeout: 30000,
    maxRetries: 3,
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  },
  
  // UI Settings
  ui: {
    defaultTheme: 'light' as const,
    animationDuration: 200,
  },
  
  // Storage
  storage: {
    prefix: 'api-testing-hub',
    version: '1.0',
  },
  
  // Features
  features: {
    history: true,
    export: true,
    import: true,
  },
} as const; 