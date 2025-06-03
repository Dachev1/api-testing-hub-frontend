import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UIStore } from '@/types';

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Theme
      theme: typeof window !== 'undefined' 
        ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        : 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-store',
    }
  )
); 