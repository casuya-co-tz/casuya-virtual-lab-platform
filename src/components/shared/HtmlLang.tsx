'use client'
import { useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'

export function HtmlLang() {
  const { lang, mounted } = useLanguage()

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('lang', lang)
    }
  }, [lang, mounted])

  return null
}
