'use client'

import Image from 'next/image'

type ProviderIconProps = {
  provider: string
  className?: string
}

const providerData: Record<string, { src: string; alt: string; bgColor: string }> = {
  mpesa: {
    src: '/images/payment-providers/mpesa.png',
    alt: 'M-Pesa',
    bgColor: '#00A859'
  },
  airtel: {
    src: '/images/payment-providers/airtel.png',
    alt: 'Airtel Money',
    bgColor: '#ED1B24'
  },
  tigo: {
    src: '/images/payment-providers/mixx.svg',
    alt: 'Mixx by Yas',
    bgColor: '#003399'
  },
  halopesa: {
    src: '/images/payment-providers/halopesa.png',
    alt: 'Halopesa',
    bgColor: '#7C3AED'
  },
  azampesa: {
    src: '/images/payment-providers/azampesa.png',
    alt: 'Azampesa',
    bgColor: '#059669'
  }
}

export function ProviderIcon({ provider, className = '' }: ProviderIconProps) {
  const data = providerData[provider] || {
    src: '',
    alt: provider,
    bgColor: '#6B7280'
  }

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl overflow-hidden ${className}`}
      style={{ backgroundColor: data.bgColor }}
    >
      <Image
        src={data.src}
        alt={data.alt}
        fill
        className="object-contain p-2"
        sizes="(max-width: 768px) 48px, 64px"
      />
    </div>
  )
}

export function ProviderIconSquare({ provider, size = 48 }: { provider: string; size?: number }) {
  const data = providerData[provider] || {
    src: '',
    alt: provider,
    bgColor: '#6B7280'
  }

  return (
    <div
      className="relative flex items-center justify-center rounded-lg overflow-hidden flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: data.bgColor }}
    >
      <Image
        src={data.src}
        alt={data.alt}
        fill
        className="object-contain p-1"
        sizes={`${size}px`}
      />
    </div>
  )
}

export { providerData }
