'use client'
import React, { useEffect } from 'react'
import { pricingTranslations } from '@/lib/i18n'

interface UpgradePromptProps {
  recommendedPlan: 'basic' | 'pro' | 'developer'
  lang: 'en' | 'sw'
  onClose?: () => void
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ recommendedPlan, lang, onClose }) => {
  const t = (key: string) => (pricingTranslations[lang] as Record<string, string>)[key] || key
  const sectionTarget = recommendedPlan === 'developer' ? 'developer' : 'standard'
  const paymentSlug = recommendedPlan === 'developer' ? 'dev_basic' : 'basic'

  useEffect(() => {
    if (!onClose) return
    const close = onClose
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('pricing.upgradePrompt.title')}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-6 overflow-hidden rounded-xl border border-border-strong bg-bg-primary shadow-2xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-blue-600" />

        <div className="text-center mt-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-4 text-xl">
            🔒
          </div>
          <h3 className="text-lg font-bold text-text-primary tracking-tight">
            {t('pricing.upgradePrompt.title')}
          </h3>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            {t('pricing.upgradePrompt.description')}
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <a
            href={`/payment?plan=${paymentSlug}&section=${sectionTarget}`}
            className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-accent-blue text-white font-medium text-sm hover:opacity-90 shadow-sm transition-all text-center"
          >
            {t('pricing.upgradePrompt.cta')}
          </a>
          <a
            href={`/pricing?section=${sectionTarget}`}
            className="w-full flex items-center justify-center py-2 px-4 rounded-lg border border-border bg-bg-secondary text-text-secondary font-medium text-sm hover:bg-bg-tertiary transition-all"
          >
            {lang === 'sw' ? 'Angalia Mikataba Yote' : 'View All Plans'}
          </a>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-lg border border-border bg-bg-secondary text-text-secondary font-medium text-sm hover:bg-bg-tertiary transition-all"
            >
              {lang === 'sw' ? 'Ghairi' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
