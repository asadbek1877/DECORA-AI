import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language } from './translations';

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (path: string) => string;
}

export const useLanguage = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (language: Language) => set({ language }),
      t: (path: string) => {
        const { language } = get();
        const keys = path.split('.');
        let value: any = translations[language];

        for (const key of keys) {
          if (value && typeof value === 'object' && key in value) {
            value = value[key];
          } else {
            return path; // Return the path if translation not found
          }
        }

        return typeof value === 'string' ? value : path;
      },
    }),
    {
      name: 'language-store',
    }
  )
);
