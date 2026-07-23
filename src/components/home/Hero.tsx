'use client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'

export function Hero() {
  const router = useRouter()
  const { lang } = useLanguage()

  const stats = [
    { value: '500K+', label: t('stats.students', lang) },
    { value: '150+', label: t('stats.labs', lang) },
    { value: '99.9%', label: t('stats.uptime', lang) },
  ]

  return (
    <section className="flex flex-col items-center text-center px-6 py-20 border-b border-border-DEFAULT">
      <h1 className="text-[clamp(28px,6vw,48px)] font-bold text-text-primary leading-[1.1] max-w-3xl">
        {t('hero.headline', lang)}
      </h1>
      <p className="text-[18px] text-text-secondary max-w-[640px] mt-4">
        {t('hero.subheadline', lang)}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Button variant="primary" className="!h-[52px] !px-8" onClick={() => router.push('/student/physics')}>{t('cta.launch', lang)}</Button>
        <Button variant="secondary" className="!h-[52px] !px-8" onClick={() => router.push('/developer')}>{t('cta.explore', lang)}</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 w-full max-w-2xl">
        {stats.map(s => (
          <div key={s.label} className="text-center">
            <p className="text-[clamp(24px,5vw,32px)] font-bold text-text-primary">{s.value}</p>
            <p className="text-[12px] uppercase tracking-[0.5px] text-text-secondary mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
