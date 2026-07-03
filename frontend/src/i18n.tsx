import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'de' | 'en'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
}

const STORAGE_KEY = 'asah-lang'

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'de',
  setLang: () => {},
})

function initialLang(): Lang {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  return stored === 'en' || stored === 'de' ? stored : 'de'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}
