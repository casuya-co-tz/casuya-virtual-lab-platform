'use client'
import React from 'react'

interface PricingCardProps {
  name: string
  nameSw: string
  price: number
  currency: string
  interval: string
  features: string[]
  lang: 'en' | 'sw'
  isCurrent?: boolean
  onSelect?: () => void
  ctaLabel?: string
}

export const PricingCard: React.FC<PricingCardProps> = ({
  name, nameSw, price, currency, interval, features, lang, isCurrent, onSelect, ctaLabel
}) => {
  return (
    <div className={`relative flex flex-col p-6 rounded-xl border transition-all ${
      isCurrent ? 'border-accent-blue bg-bg-tertiary' : 'border-border-default hover:border-border-strong'
    }`}>
      {isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-0.5 rounded-full bg-accent-blue text-white">
          {lang === 'sw' ? 'Kifurushi Chako' : 'Current Plan'}
        </span>
      )}
      <h3 className="text-lg font-bold text-text-primary">{lang === 'sw' ? nameSw : name}</h3>
      <div className="mt-2 mb-4">
        <span className="text-3xl font-extrabold text-text-primary">
          {price === 0 ? 'TSh 0' : `TSh ${price.toLocaleString()}`}
        </span>
        {price > 0 && (
          <span className="text-sm text-text-secondary ml-1">
            /{interval === 'monthly' ? (lang === 'sw' ? 'mwezi' : 'mo') : (lang === 'sw' ? 'mwaka' : 'yr')}
          </span>
        )}
      </div>
      <ul className="flex-1 space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="text-accent-green mt-0.5">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        disabled={isCurrent}
        className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${
          isCurrent
            ? 'bg-bg-muted text-text-muted cursor-not-allowed'
            : 'bg-primary text-white hover:bg-opacity-90'
        }`}
      >
        {isCurrent ? (lang === 'sw' ? 'Ya Sasa' : 'Current') : (ctaLabel || (lang === 'sw' ? 'Chagua' : 'Select'))}
      </button>
    </div>
  )
}
