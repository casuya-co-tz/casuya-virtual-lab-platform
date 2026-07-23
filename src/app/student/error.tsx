'use client'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { lang } = useLanguage()
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-[20px] font-bold text-text-primary mb-2">{t('error.title', lang)}</h2>
      <p className="text-[14px] text-text-secondary mb-6 max-w-md">
        {error.message || t('error.unexpected', lang)}
      </p>
      <Button variant="primary" onClick={reset}>{t('error.tryAgain', lang)}</Button>
    </div>
  )
}
