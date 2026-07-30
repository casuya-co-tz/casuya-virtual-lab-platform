'use client'
import React from 'react'

interface SubscriptionStatusProps {
  lang: 'en' | 'sw'
  status: {
    tierName: string
    tierNameSw: string
    expiresAt: string | null
    usageCount: number
    usageLimit: number | null
  }
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ lang, status }) => {
  const isInfinite = status.usageLimit === null
  const percentage = isInfinite ? 0 : Math.min(100, (status.usageCount / status.usageLimit!) * 100)

  return (
    <div className="p-5 rounded-xl border border-border bg-bg-secondary shadow-sm max-w-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {lang === 'sw' ? 'Kifurushi Chako' : 'Subscription Status'}
        </span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green border border-accent-green/20">
          {lang === 'sw' ? status.tierNameSw : status.tierName}
        </span>
      </div>

      {status.usageLimit && (
        <div className="mt-4">
          <div className="flex justify-between text-xs font-medium text-text-secondary mb-1">
            <span>{lang === 'sw' ? 'Matumizi ya Mfumo' : 'API Request Resource Pool'}</span>
            <span>{status.usageCount.toLocaleString()} / {status.usageLimit.toLocaleString()}</span>
          </div>
          <div className="w-full bg-bg-tertiary h-2 rounded-full overflow-hidden border border-border">
            <div
              className={`h-full transition-all duration-500 ${percentage > 85 ? 'bg-red-500' : 'bg-accent-blue'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
        <span>{lang === 'sw' ? 'Mwisho wa Kifurushi:' : 'Renewal Date:'}</span>
        <span className="font-semibold text-text-secondary">
          {status.expiresAt
            ? new Date(status.expiresAt).toLocaleDateString(lang === 'sw' ? 'sw-TZ' : 'en-TZ', { dateStyle: 'medium' })
            : (lang === 'sw' ? 'Hakiishi' : 'No Expiration')}
        </span>
      </div>
    </div>
  )
}
