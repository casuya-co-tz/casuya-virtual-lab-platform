'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { BillingTable } from '@/components/admin/BillingTable'

interface Subscription {
  id: string
  user_name: string
  school_name: string | null
  tier: string
  status: string
  amount: number
  currency: string
  expires_at: string
  created_at: string
}

export default function AdminBillingPage() {
  const { lang } = useLanguage()
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(() => {
        setSubs([])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  return (
    <div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('admin.billing', lang)}</h1>
      {subs.length === 0 ? (
        <Card>
          <p className="text-[14px] text-text-secondary text-center py-8">{t('admin.noSubscriptions', lang)}</p>
        </Card>
      ) : (
        <BillingTable subscriptions={subs} />
      )}
    </div>
  )
}
