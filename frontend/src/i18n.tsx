import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { translations, type Lang } from './translations'

export type { Lang }

export type TVars = Record<string, string | number>

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string, vars?: TVars) => string
}

// Merkt die Sprachwahl ueber Sitzungen hinweg
const STORAGE_KEY = 'asah-lang'

function translate(lang: Lang, key: string, vars?: TVars): string {
  // Fehlt ein Schluessel in der gewaehlten Sprache, greift Deutsch
  const template = translations[lang][key] ?? translations.de[key] ?? key
  if (!vars) return template
  // Platzhalter der Form {name} werden durch uebergebene Werte ersetzt
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match))
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'de',
  setLang: () => {},
  t: (key) => key,
})

function initialLang(): Lang {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  return stored === 'en' || stored === 'de' ? stored : 'de'
}

// Haelt die aktuelle Sprache und stellt die Funktion t bereit
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = translate(lang, 'app.title')
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t: (key, vars) => translate(lang, key, vars) }),
    [lang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}
