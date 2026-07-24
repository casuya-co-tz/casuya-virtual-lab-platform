'use client'
import React from 'react'
import { PricingCard } from './PricingCard'

interface Plan {
  slug: string
  name: string
  name_sw: string
  price: number
  currency: string
  interval: string
  features: string[]
}

interface PricingSectionProps {
  title: string
  plans: Plan[]
  lang: 'en' | 'sw'
  currentPlanSlug?: string
  onSelectPlan?: (slug: string) => void
}

export const PricingSection: React.FC<PricingSectionProps> = ({ title, plans, lang, currentPlanSlug, onSelectPlan }) => {
  return (
    <section className="mb-16">
      <h2 className="text-xl font-bold text-text-primary mb-6 text-center">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map(plan => (
          <PricingCard
            key={plan.slug}
            name={plan.name}
            nameSw={plan.name_sw}
            price={plan.price}
            currency={plan.currency}
            interval={plan.interval}
            features={plan.features}
            lang={lang}
            isCurrent={plan.slug === currentPlanSlug}
            onSelect={() => onSelectPlan?.(plan.slug)}
          />
        ))}
      </div>
    </section>
  )
}
