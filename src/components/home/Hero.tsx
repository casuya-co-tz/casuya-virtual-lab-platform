'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'

export function Hero() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [statsData, setStatsData] = useState({ total_students: 0, total_labs: 0, uptime: '99.97%' })

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStatsData(d) })
      .catch(() => {})
  }, [])

  const stats = useMemo(() => [
    { value: statsData.total_students.toLocaleString(), label: t('stats.students', lang) },
    { value: String(statsData.total_labs), label: t('stats.labs', lang) },
    { value: statsData.uptime, label: t('stats.uptime', lang) },
  ], [statsData.total_students, statsData.total_labs, statsData.uptime, lang])

  return (
    <section className="relative px-4 sm:px-6 py-10 sm:py-20 lg:py-24 border-b border-border bg-bg-primary overflow-hidden mesh-gradient-bg">
      {/* Glow orbs */}
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      <div className="glow-orb glow-orb-3" />

      {/* Grid overlay */}
      <div className="grid-overlay" />

      {/* Noise texture */}
      <div className="noise-overlay" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* Left Side */}
        <div className="lg:col-span-7 space-y-5">
          <h1 className="text-[clamp(24px,5vw,56px)] font-extrabold tracking-tight leading-[1.1] text-text-primary">
            {t('hero.headline', lang)}
          </h1>

          <p className="text-[14px] sm:text-[17px] text-text-secondary max-w-xl leading-relaxed">
            {t('hero.subheadline', lang)}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Button variant="primary" className="!h-11 sm:!h-12 !px-6 w-full sm:w-auto" onClick={() => router.push('/student')}>
              {t('cta.launch', lang)}
            </Button>
            <Button variant="secondary" className="!h-11 sm:!h-12 !px-6 w-full sm:w-auto" onClick={() => router.push('/auth?role=teacher')}>
              {t('cta.explore', lang)}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-border mt-6">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-[clamp(18px,4vw,30px)] font-extrabold text-accent-blue">{s.value}</div>
                <div className="text-[9px] sm:text-[11px] uppercase tracking-wider text-text-secondary mt-0.5 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Benefits Panel */}
        <div className="lg:col-span-5">
          <div className="p-5 sm:p-8 bg-bg-secondary border border-border-strong space-y-5">
            <h3 className="text-[18px] sm:text-[20px] font-bold text-text-primary">{t('hero.benefitsTitle', lang)}</h3>
            <div className="space-y-4 text-[13px] sm:text-[14px] text-text-secondary leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="text-accent-blue font-bold text-[16px] sm:text-[18px] shrink-0">🚀</span>
                <div>{t('hero.benefitStudent', lang)}</div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent-purple font-bold text-[16px] sm:text-[18px] shrink-0">📊</span>
                <div>{t('hero.benefitTeacher', lang)}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
