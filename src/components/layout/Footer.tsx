'use client'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

export function Footer() {
  const { lang } = useLanguage()
  return (
    <footer className="border-t border-border-DEFAULT bg-bg-primary px-6 py-8 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[12px] text-text-secondary">&copy; {new Date().getFullYear()} Casuya Technologies</p>
        <div className="flex gap-4">
          <a href="/privacy" className="text-[12px] text-text-secondary hover:text-text-primary">{t('footer.privacy', lang)}</a>
          <a href="/terms" className="text-[12px] text-text-secondary hover:text-text-primary">{t('footer.terms', lang)}</a>
          <a href="/docs" className="text-[12px] text-text-secondary hover:text-text-primary">{t('footer.docs', lang)}</a>
          <a href="/developer/docs" className="text-[12px] text-text-secondary hover:text-text-primary">{t('footer.api', lang)}</a>
          <a href="/contact" className="text-[12px] text-text-secondary hover:text-text-primary">{t('footer.contact', lang)}</a>
        </div>
      </div>
    </footer>
  )
}
