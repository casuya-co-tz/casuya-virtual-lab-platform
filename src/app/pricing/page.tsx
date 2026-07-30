'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { pricingTranslations } from '@/lib/i18n'
import { PricingSection } from '@/components/pricing/PricingSection'
import { FeatureComparison } from '@/components/pricing/FeatureComparison'
import { SubscriptionStatus } from '@/components/pricing/SubscriptionStatus'

interface Plan {
  id: string
  slug: string
  name: string
  name_sw: string
  price: number
  currency: string
  interval: string
  user_type: string
  features: string[]
  rate_limit_per_min: number | null
  burst_per_min: number | null
}

export default function PricingPage() {
  const { lang } = useLanguage()
  const router = useRouter()
  const t = (key: string) => (pricingTranslations[lang] as Record<string, string>)[key] || key
  const [standardPlans, setStandardPlans] = useState<Plan[]>([])
  const [developerPlans, setDeveloperPlans] = useState<Plan[]>([])
  const [currentPlanSlug, setCurrentPlanSlug] = useState<string | undefined>()
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const section = params.get('section')
    if (section) {
      const el = document.getElementById(`section-${section}`)
      el?.scrollIntoView({ behavior: 'smooth' })
    }

    Promise.all([
      fetch('/api/pricing/plans?user_type=standard').then(r => r.json()),
      fetch('/api/pricing/plans?user_type=developer').then(r => r.json()),
      fetch('/api/subscription').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([std, dev, sub]) => {
      setStandardPlans(std)
      setDeveloperPlans(dev)
      if (sub?.plan?.slug) {
        setCurrentPlanSlug(sub.plan.slug)
      } else {
        setCurrentPlanSlug('free')
      }
      if (sub?.subscription) setSubscription(sub)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const resolveFeatures = (featureKeys?: string[]): string[] => {
    return (featureKeys || []).map(key => {
      const translated = (pricingTranslations[lang] as Record<string, string>)[key]
      return translated || key.replace('pricing.features.', '')
    })
  }

  const standardFeatures = standardPlans.map(p => ({
    slug: p.slug,
    name: p.name,
    name_sw: p.name_sw,
    price: p.price,
    currency: p.currency,
    interval: p.interval,
    features: resolveFeatures(p.features),
  }))

  const developerFeatures = developerPlans.map(p => ({
    slug: p.slug,
    name: p.name,
    name_sw: p.name_sw,
    price: p.price,
    currency: p.currency,
    interval: p.interval,
    features: resolveFeatures(p.features),
  }))

  const comparisonFeatures: Array<{ key: string; matrix: Record<string, boolean | string> }> = [
    { key: 'pricing.features.freeLabs', matrix: { free: true, basic: true, pro: true, institution: true, dev_free: false, dev_basic: false, dev_pro: false, dev_enterprise: false } },
    { key: 'pricing.features.allLabs', matrix: { free: false, basic: true, pro: true, institution: true, dev_free: false, dev_basic: false, dev_pro: false, dev_enterprise: false } },
    { key: 'pricing.features.offlineSync', matrix: { free: false, basic: true, pro: true, institution: true, dev_free: false, dev_basic: false, dev_pro: false, dev_enterprise: false } },
    { key: 'pricing.features.examPrep', matrix: { free: false, basic: true, pro: true, institution: true, dev_free: false, dev_basic: false, dev_pro: false, dev_enterprise: false } },
    { key: 'pricing.features.analytics', matrix: { free: false, basic: false, pro: true, institution: true, dev_free: false, dev_basic: false, dev_pro: false, dev_enterprise: false } },
    { key: 'pricing.features.prioritySupport', matrix: { free: false, basic: false, pro: true, institution: true, dev_free: false, dev_basic: false, dev_pro: true, dev_enterprise: true } },
    { key: 'pricing.features.teacherTools', matrix: { free: false, basic: false, pro: 'teachers', institution: true, dev_free: false, dev_basic: false, dev_pro: false, dev_enterprise: false } },
    { key: 'pricing.features.schoolWide', matrix: { free: false, basic: false, pro: false, institution: true, dev_free: false, dev_basic: false, dev_pro: false, dev_enterprise: false } },
    { key: 'pricing.features.apiAccess', matrix: { free: false, basic: false, pro: false, institution: 'read', dev_free: 'basic', dev_basic: true, dev_pro: true, dev_enterprise: true } },
    { key: 'pricing.features.apiKeys5', matrix: { free: false, basic: false, pro: false, institution: false, dev_free: false, dev_basic: true, dev_pro: true, dev_enterprise: true } },
    { key: 'pricing.features.apiKeysUnlimited', matrix: { free: false, basic: false, pro: false, institution: false, dev_free: false, dev_basic: false, dev_pro: false, dev_enterprise: true } },
    { key: 'pricing.features.webhooks', matrix: { free: false, basic: false, pro: false, institution: false, dev_free: false, dev_basic: true, dev_pro: true, dev_enterprise: true } },
    { key: 'pricing.features.sla', matrix: { free: false, basic: false, pro: false, institution: false, dev_free: false, dev_basic: false, dev_pro: '99.5%', dev_enterprise: '99.9%' } },
    { key: 'pricing.features.dedicatedSupport', matrix: { free: false, basic: false, pro: false, institution: true, dev_free: false, dev_basic: false, dev_pro: false, dev_enterprise: true } },
    { key: 'pricing.features.customRateLimits', matrix: { free: false, basic: false, pro: false, institution: false, dev_free: false, dev_basic: false, dev_pro: false, dev_enterprise: true } },
  ]

  const allPlanSlugs = [...standardPlans, ...developerPlans].map(p => ({ slug: p.slug, name: p.name, name_sw: p.name_sw }))
  const filteredComparison = comparisonFeatures.filter(f => {
    return allPlanSlugs.some(p => f.matrix[p.slug] !== false)
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
        <div className="text-text-secondary">{lang === 'sw' ? 'Inapakia...' : 'Loading...'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2 text-center">
          {t('pricing.title')}
        </h1>
        <p className="text-[14px] text-text-secondary text-center mb-12">
          {t('pricing.subtitle')}
        </p>

        <div id="section-standard">
          <PricingSection
            title={t('pricing.standardSection')}
            plans={standardFeatures}
            lang={lang}
            currentPlanSlug={currentPlanSlug}
            onSelectPlan={(slug) => router.push(`/payment?plan=${slug}&section=standard`)}
          />
        </div>

        <div id="section-developer">
          <PricingSection
            title={t('pricing.developerSection')}
            plans={developerFeatures}
            lang={lang}
            currentPlanSlug={currentPlanSlug}
            onSelectPlan={(slug) => router.push(`/payment?plan=${slug}&section=developer`)}
          />
        </div>

        {allPlanSlugs.length > 0 && (
          <FeatureComparison
            lang={lang}
            plans={allPlanSlugs}
            features={filteredComparison}
          />
        )}

        {subscription?.subscription && (
          <div className="mt-12">
            <SubscriptionStatus
              lang={lang}
              status={{
                tierName: subscription.plan?.name || currentPlanSlug || 'Free',
                tierNameSw: subscription.plan?.name_sw || currentPlanSlug || 'Bure',
                expiresAt: subscription.subscription.expires_at || null,
                usageCount: subscription.subscription.requests_used || 0,
                usageLimit: subscription.plan?.rate_limit_per_min || null,
              }}
            />
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-text-secondary">
            💡 {lang === 'sw' ? 'Lipa kwa M-Pesa, Airtel Money, Mixx by Yas, Halopesa, au Azampesa' : 'Pay with M-Pesa, Airtel Money, Mixx by Yas, Halopesa, or Azampesa'}
          </p>
        </div>
      </div>
    </div>
  )
}
