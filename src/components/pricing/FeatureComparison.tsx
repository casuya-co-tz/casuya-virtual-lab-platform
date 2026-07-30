'use client'
import React from 'react'
import { pricingTranslations } from '@/lib/i18n'

interface FeatureComparisonProps {
  lang: 'en' | 'sw'
  plans: Array<{ slug: string; name: string; name_sw: string }>
  features: Array<{ key: string; matrix: Record<string, boolean | string> }>
}

export const FeatureComparison: React.FC<FeatureComparisonProps> = ({ lang, plans, features }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-bg-secondary shadow-sm mt-12 -mx-4 sm:mx-0">
      <div className="min-w-[800px]">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-tertiary">
              <th className="p-4 font-semibold text-text-primary min-w-[200px]">
                {lang === 'sw' ? 'Vipengele vya Kifurushi' : 'Plan Features'}
              </th>
              {plans.map((p) => (
                <th key={p.slug} className="p-4 font-semibold text-text-primary text-center">
                  {lang === 'sw' ? p.name_sw : p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {features.map((f) => (
              <tr key={f.key} className="hover:bg-bg-tertiary transition-colors">
                <td className="p-4 font-medium text-text-secondary">
                  {(pricingTranslations[lang] as Record<string, string>)[f.key] || f.key}
                </td>
                {plans.map((p) => {
                  const spec = f.matrix[p.slug]
                  return (
                    <td key={p.slug} className="p-4 text-center text-text-secondary">
                      {typeof spec === 'boolean' ? (
                        spec ? (
                          <span className="text-accent-green text-base font-bold">✓</span>
                        ) : (
                          <span className="text-text-secondary opacity-30">—</span>
                        )
                      ) : (
                        <span className="font-semibold text-xs bg-bg-tertiary px-2 py-1 rounded border border-border">{spec}</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
