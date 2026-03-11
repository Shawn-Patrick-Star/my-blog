import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings } from '../types';

interface SettingsState {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  apiMode: 'official',
  apiKey: '',
  baseUrl: process.env.NEXT_PUBLIC_AI_BASE_URL || '',
  modelName: process.env.NEXT_PUBLIC_AI_MODEL_NAME || '',
  userLevel: '四级',
  topic: '日常生活',
  customTopic: '',
  hasCompletedOnboarding: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'english-tutor-settings',
    }
  )
);
