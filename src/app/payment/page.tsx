'use client'
import { useState, useEffect, useRef, FormEvent, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Plan {
  id: string
  slug: string
  name: string
  name_sw: string
  price: number
  currency: string
  interval: string
  features: string[]
}

import { ProviderIconSquare } from './ProviderIcons'

const PROVIDERS = [
  { id: 'mpesa', label: 'Vodacom M-Pesa', phoneLabel: { en: 'Vodacom M-Pesa Phone Number', sw: 'Nambari ya Simu ya Vodacom M-Pesa' }, btnLabel: { en: 'Pay with M-Pesa', sw: 'Lipa kwa M-Pesa' } },
  { id: 'airtel', label: 'Airtel Money', phoneLabel: { en: 'Airtel Money Phone Number', sw: 'Nambari ya Simu ya Airtel Money' }, btnLabel: { en: 'Pay with Airtel Money', sw: 'Lipa kwa Airtel Money' } },
  { id: 'tigo', label: 'Mixx by Yas', phoneLabel: { en: 'Mixx by Yas Phone Number', sw: 'Nambari ya Simu ya Mixx by Yas' }, btnLabel: { en: 'Pay with Mixx by Yas', sw: 'Lipa kwa Mixx by Yas' } },
  { id: 'halopesa', label: 'Halopesa', phoneLabel: { en: 'Halopesa Phone Number', sw: 'Nambari ya Simu ya Halopesa' }, btnLabel: { en: 'Pay with Halopesa', sw: 'Lipa kwa Halopesa' } },
  { id: 'azampesa', label: 'Azampesa', phoneLabel: { en: 'Azampesa Phone Number', sw: 'Nambari ya Simu ya Azampesa' }, btnLabel: { en: 'Pay with Azampesa', sw: 'Lipa kwa Azampesa' } },
]

const PHONE_PREFIXES: Record<string, string> = {
  '071': 'mpesa', '072': 'mpesa', '073': 'mpesa', '074': 'mpesa', '075': 'mpesa',
  '068': 'airtel', '069': 'airtel', '078': 'airtel', '079': 'airtel',
  '065': 'tigo', '067': 'tigo', '070': 'tigo',
  '062': 'halopesa',
}

function detectProvider(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '')
  const local = cleaned.startsWith('255') ? cleaned.slice(3) : cleaned.startsWith('0') ? cleaned.slice(1) : cleaned
  return PHONE_PREFIXES[local.slice(0, 3)] || null
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  )
}

function PaymentContent() {
  const { lang } = useLanguage()
  const searchParams = useSearchParams()
  const planSlug = searchParams.get('plan')

  const [step, setStep] = useState<'loading' | 'form' | 'processing' | 'complete'>('loading')
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [provider, setProvider] = useState('mpesa')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; transactionId?: string } | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const section = searchParams.get('section') || 'standard'
    fetch(`/api/pricing/plans?user_type=${section}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to load plans')
        const data = await r.json()
        if (!Array.isArray(data)) throw new Error('Invalid plans response')
        return data as Plan[]
      })
      .then((data) => {
        setPlans(data)
        const match = planSlug ? data.find((p) => p.slug === planSlug) : data[1]
        if (match) {
          setSelectedPlan(match)
        } else if (data.length > 0) {
          setSelectedPlan(data[0])
        }
        setStep('form')
      })
      .catch(() => setStep('form'))
  }, [planSlug, searchParams])

  function validatePhone(val: string): string {
    const cleaned = val.replace(/\D/g, '')
    if (cleaned.length === 0) return ''
    if (cleaned.startsWith('255')) {
      if (cleaned.length < 12) return lang === 'sw' ? 'Nambari ya simu ni fupi. Tumia mfano: 255712345678' : 'Phone number too short. Use format: 255712345678'
      if (cleaned.length > 12) return lang === 'sw' ? 'Nambari ya simu ni ndefu' : 'Phone number too long'
      return ''
    }
    if (cleaned.startsWith('0')) {
      if (cleaned.length < 10) return lang === 'sw' ? 'Nambari ya simu ni fupi. Tumia mfano: 0712345678' : 'Phone number too short. Use format: 0712345678'
      if (cleaned.length > 10) return lang === 'sw' ? 'Nambari ya simu ni ndefu' : 'Phone number too long'
      const prefix = cleaned.slice(0, 3)
      const validPrefixes = ['062', '065', '067', '068', '069', '070', '071', '072', '073', '074', '075', '076', '078', '079']
      if (!validPrefixes.includes(prefix)) return lang === 'sw' ? 'Nambari ya simu si ya Tanzania. Tumia: 07X, 06X' : 'Not a valid Tanzania number. Use: 07X or 06X'
      return ''
    }
    return lang === 'sw' ? 'Anza na 0 au 255. Mfano: 0712345678' : 'Start with 0 or 255. Example: 0712345678'
  }

  function handlePhoneChange(val: string) {
    const digitsOnly = val.replace(/[^\d]/g, '')
    setPhone(digitsOnly)
    setPhoneError(validatePhone(digitsOnly))
    const detected = detectProvider(digitsOnly)
    if (detected) setProvider(detected)
  }

  async function handlePay(e: FormEvent) {
    e.preventDefault()
    if (!selectedPlan) return
    const err = validatePhone(phone)
    if (err) { setPhoneError(err); return }
    setLoading(true)
    setStep('processing')
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          phone,
          provider,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setResult({ success: false, message: err.error || t('payment.error', lang) })
        setStep('complete')
      } else {
        const data = await res.json()
        if (data.transaction_id) {
          pollPaymentStatus(data.transaction_id)
        } else {
          setResult({ success: true, message: data.message || 'Payment initiated.' })
          setStep('complete')
        }
      }
    } catch {
      setResult({ success: false, message: t('payment.error', lang) })
      setStep('complete')
    }
    setLoading(false)
  }

  async function pollPaymentStatus(txId: string) {
    let attempts = 0
    const maxAttempts = 30
    const interval = 3000

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setResult({ success: false, message: t('payment.timeout', lang) || 'Payment timed out. Please check your phone.', transactionId: txId })
        setStep('complete')
        return
      }
      attempts++
      try {
        const res = await fetch(`/api/payments/status/${txId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'completed') {
            setResult({ success: true, message: t('payment.successTitle', lang), transactionId: txId })
            setStep('complete')
            return
          } else if (data.status === 'failed') {
            setResult({ success: false, message: t('payment.failTitle', lang), transactionId: txId })
            setStep('complete')
            return
          }
        }
      } catch {}
      pollTimerRef.current = setTimeout(poll, interval)
    }
    poll()
  }

  const displayName = selectedPlan
    ? (lang === 'sw' ? selectedPlan.name_sw : selectedPlan.name)
    : ''

  const activeProvider = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0]

  return (
    <div className="min-h-screen bg-bg-secondary px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2 text-center">
          {t('payment.title', lang)}
        </h1>
        <p className="text-[14px] text-text-secondary text-center mb-8">
          {t('payment.subtitle', lang)}
        </p>

        {step === 'loading' && (
          <Card className="text-center py-12">
            <p className="text-text-secondary">{lang === 'sw' ? 'Inapakia...' : 'Loading...'}</p>
          </Card>
        )}

        {step === 'form' && selectedPlan && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
              {plans.filter(p => p.price > 0).map(plan => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all ${selectedPlan.id === plan.id ? 'border-accent-blue bg-bg-tertiary' : 'hover:border-border-strong'}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <h3 className="text-[16px] font-bold text-text-primary">
                    {lang === 'sw' ? plan.name_sw : plan.name}
                  </h3>
                  <p className="text-[28px] font-bold text-text-primary mt-1">
                    TSh {plan.price.toLocaleString()}
                  </p>
                  <p className="text-[12px] text-text-secondary mt-2">
                    {plan.interval === 'yearly' ? (lang === 'sw' ? 'kwa mwaka' : 'per year') : (lang === 'sw' ? 'kwa mwezi' : 'per month')}
                  </p>
                  {selectedPlan.id === plan.id && (
                    <div className="mt-3 h-2 bg-accent-blue rounded" />
                  )}
                </Card>
              ))}
            </div>

            <Card className="max-w-md mx-auto">
              <div className="mb-6 text-center">
                <h2 className="text-[16px] font-bold text-text-primary">
                  {displayName}
                </h2>
                <p className="text-[22px] sm:text-[24px] font-bold text-text-primary mt-1">
                  TSh {selectedPlan.price.toLocaleString()}
                </p>
                <p className="text-[12px] text-text-secondary mt-1">
                  {selectedPlan.interval === 'yearly' ? (lang === 'sw' ? 'Malipo ya mwaka' : 'Yearly payment') : (lang === 'sw' ? 'Malipo ya mwezi' : 'Monthly payment')}
                </p>
              </div>
              <form onSubmit={handlePay} className="flex flex-col gap-4">
                <div>
                  <Input
                    label={lang === 'sw' ? activeProvider.phoneLabel.sw : activeProvider.phoneLabel.en}
                    placeholder={lang === 'sw' ? '0712345678' : '0712345678'}
                    value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    required
                  />
                  {phoneError && phone.length > 0 && (
                    <p className="text-[12px] text-accent-red mt-1">{phoneError}</p>
                  )}
                  {!phoneError && phone.length > 0 && (
                    <p className="text-[12px] text-accent-green mt-1">
                      {lang === 'sw' ? 'Nambari ya simu ni sahihi' : 'Valid phone number'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[13px] text-text-secondary mb-2 block">
                    {lang === 'sw' ? 'Lipa kupitia' : 'Pay with'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PROVIDERS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProvider(p.id)}
                        className={`flex items-center gap-1 sm:gap-2 p-2 sm:p-2.5 rounded-lg border text-[11px] sm:text-[13px] font-medium transition-all ${
                          provider === p.id
                            ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                            : 'border-border hover:border-border-strong text-text-primary'
                        }`}
                      >
                        <ProviderIconSquare provider={p.id} size={20} />
                        <span className="truncate">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button variant="primary" className="!h-12 w-full sm:w-auto" disabled={loading}>
                  {loading ? t('payment.processing', lang) : (lang === 'sw' ? activeProvider.btnLabel.sw : activeProvider.btnLabel.en)}
                </Button>
              </form>
            </Card>
          </>
        )}

        {step === 'processing' && (
          <Card className="text-center py-12">
            <div className="h-12 w-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-[18px] font-bold text-text-primary mb-2">
              {t('payment.processingTitle', lang)}
            </h3>
            <p className="text-text-secondary">
              {lang === 'sw'
                ? `Tafadhali angalia simu yako kwa ombi la ${activeProvider.label}...`
                : `Please check your phone for the ${activeProvider.label} prompt...`
              }
            </p>
          </Card>
        )}

        {step === 'complete' && result && (
          <Card className="text-center py-12">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.success ? 'bg-accent-green/10' : 'bg-accent-red/10'}`}>
              <span className="text-[32px]">{result.success ? '\u2713' : '\u2717'}</span>
            </div>
            <h3 className="text-[18px] font-bold text-text-primary mb-2">
              {result.success ? t('payment.successTitle', lang) : t('payment.failTitle', lang)}
            </h3>
            <p className="text-text-secondary mb-4">{result.message}</p>
            {result.transactionId && (
              <p className="text-[13px] text-text-secondary mb-4">
                {t('payment.transactionId', lang)}: {result.transactionId}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {result.success && (
                <Button variant="primary" onClick={() => window.location.href = '/student'}>
                  {lang === 'sw' ? 'Rudi Dashibodi' : 'Back to Dashboard'}
                </Button>
              )}
              <Button variant="secondary" onClick={() => { setStep('form'); setResult(null); setPhone(''); setPhoneError('') }}>
                {t('payment.newPayment', lang)}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
