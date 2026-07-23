'use client'
import { Card } from '@/components/ui/Card'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

export default function AdminBillingPage() {
  const { lang } = useLanguage()

  return (
    <div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('admin.billing', lang)}</h1>
      <Card>
        <p className="text-[14px] text-text-secondary text-center py-8">{t('admin.noSubscriptions', lang)}</p>
      </Card>
    </div>
  )
}
