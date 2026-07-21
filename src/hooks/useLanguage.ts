'use client'
import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'casuya-lang'

export function useLanguage() {
  const [lang, setLang] = useState<'en' | 'sw'>('en')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as 'en' | 'sw' | null
    if (stored === 'en' || stored === 'sw') setLang(stored)
  }, [])

  const setLangPersisted = useCallback((l: 'en' | 'sw') => {
    setLang(l)
    localStorage.setItem(STORAGE_KEY, l)
    document.documentElement.setAttribute('lang', l)
  }, [])

  const toggle = useCallback(() => {
    setLangPersisted(lang === 'en' ? 'sw' : 'en')
  }, [lang, setLangPersisted])

  return { lang, setLang: setLangPersisted, toggle }
}
