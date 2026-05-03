import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { i18n, type Language } from '@repo/i18n'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  initLanguage: () => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ar',
      setLanguage: (lang) => {
        i18n.changeLanguage(lang)
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = lang
        set({ language: lang })
      },
      initLanguage: () => {
        const stored = useLanguageStore.getState().language
        i18n.changeLanguage(stored)
        document.documentElement.dir = stored === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = stored
      },
    }),
    {
      name: 'language-storage',
    }
  )
)
