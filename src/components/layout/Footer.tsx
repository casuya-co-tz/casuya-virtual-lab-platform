'use client'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

export function Footer() {
  const { lang } = useLanguage()
  return (
    <footer className="border-t border-border bg-bg-primary px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-[11px] sm:text-[12px] text-text-secondary">&copy; {new Date().getFullYear()} Casuya Technologies</p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 sm:gap-4">
          <a href="/privacy" className="text-[11px] sm:text-[12px] text-text-secondary hover:text-text-primary transition-colors">{t('footer.privacy', lang)}</a>
          <a href="/terms" className="text-[11px] sm:text-[12px] text-text-secondary hover:text-text-primary transition-colors">{t('footer.terms', lang)}</a>
          <a href="/docs" className="text-[11px] sm:text-[12px] text-text-secondary hover:text-text-primary transition-colors">{t('footer.docs', lang)}</a>
          <a href="/developer/docs" className="text-[11px] sm:text-[12px] text-text-secondary hover:text-text-primary transition-colors">{t('footer.api', lang)}</a>
          <a href="/contact" className="text-[11px] sm:text-[12px] text-text-secondary hover:text-text-primary transition-colors">{t('footer.contact', lang)}</a>
        </div>
      </div>
    </footer>
  )
}
