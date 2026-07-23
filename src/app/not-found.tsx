'use client'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

export default function NotFound() {
  const { lang } = useLanguage()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-secondary px-4">
      <p className="text-[clamp(48px,10vw,72px)] font-bold text-accent-blue mb-4">404</p>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2">{t('error.notFound', lang)}</h1>
      <p className="text-[14px] text-text-secondary mb-6">{t('error.notFoundDesc', lang)}</p>
      <a href="/" className="text-[14px] text-accent-blue underline">{t('common.goHome', lang)}</a>
    </div>
  )
}
