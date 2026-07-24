import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Casuya Virtual Lab',
  description: 'Choose the plan that fits your learning or development needs.',
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
