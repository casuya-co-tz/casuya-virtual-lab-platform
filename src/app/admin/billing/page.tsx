'use client'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { PricingManager } from '@/components/admin/PricingManager'

interface AdminPlan {
  id: string
  slug: string
  name: string
  name_sw: string
  price: number
  user_type: 'standard' | 'developer'
  is_active: boolean
}

export default function AdminBillingPage() {
  const { lang } = useLanguage()
  const [plans, setPlans] = useState<AdminPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/pricing/plans')
      .then(r => r.json())
      .then(data => {
        setPlans(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">
        {t('admin.billing', lang)}
      </h1>
      {loading ? (
        <p className="text-text-secondary">{lang === 'sw' ? 'Inapakia...' : 'Loading...'}</p>
      ) : (
        <PricingManager initialPlans={plans} />
      )}
    </div>
  )
}
