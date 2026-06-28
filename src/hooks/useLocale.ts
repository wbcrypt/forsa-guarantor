import { useState, useEffect } from 'react'
import { getLocale, setLocale, t, Locale } from '../lib/i18n'

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(getLocale())

  useEffect(() => {
    const handler = () => setLocaleState(getLocale())
    window.addEventListener('localechange', handler)
    return () => window.removeEventListener('localechange', handler)
  }, [])

  const changeLocale = (l: Locale) => { setLocale(l); setLocaleState(l) }

  return { locale, changeLocale, t }
}
