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
    <section className="px-6 py-16 sm:py-24 border-b border-border-default bg-bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Content & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-[clamp(32px,5vw,60px)] font-extrabold tracking-tight leading-[1.1] text-text-primary">
            {t('hero.headline', lang)}
          </h1>

          <p className="text-[18px] text-text-secondary max-w-xl leading-relaxed">
            {t('hero.subheadline', lang)}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button variant="primary" className="!h-[52px] !px-8" onClick={() => router.push('/student')}>
              {t('cta.launch', lang)}
            </Button>
            <Button variant="secondary" className="!h-[52px] !px-8" onClick={() => router.push('/auth?role=teacher')}>
              {t('cta.explore', lang)}
            </Button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border-default mt-8">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-[clamp(24px,4vw,32px)] font-extrabold text-accent-blue">{s.value}</div>
                <div className="text-[10px] sm:text-[12px] uppercase tracking-wider text-text-secondary mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Benefits Panel */}
        <div className="lg:col-span-5">
          <div className="p-8 bg-bg-secondary border border-border-strong space-y-6">
            <h3 className="text-[20px] font-bold text-text-primary">{t('hero.benefitsTitle', lang)}</h3>
            <div className="space-y-4 text-[14px] text-text-secondary leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="text-accent-blue font-bold text-[18px]">🚀</span>
                <div>{t('hero.benefitStudent', lang)}</div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent-purple font-bold text-[18px]">📊</span>
                <div>{t('hero.benefitTeacher', lang)}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
