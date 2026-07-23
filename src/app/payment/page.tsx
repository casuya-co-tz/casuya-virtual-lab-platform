'use client'
import { useState, FormEvent } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function PaymentPage() {
  const { lang } = useLanguage()
  const [step, setStep] = useState<'form' | 'processing' | 'complete'>('form')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; transactionId?: string } | null>(null)

  const plans = [
    { id: 'basic', name: t('payment.basic', lang), price: 5000, description: t('payment.basicDesc', lang) },
    { id: 'pro', name: t('payment.pro', lang), price: 15000, description: t('payment.proDesc', lang) },
    { id: 'institution', name: t('payment.institution', lang), price: 50000, description: t('payment.institutionDesc', lang) },
  ]
  const [selectedPlan, setSelectedPlan] = useState(plans[1].id)

  async function handlePay(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStep('processing')
    try {
      const res = await fetch('/api/payments/mpesa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount: parseInt(amount) }),
      })
      if (!res.ok) {
        setResult({ success: false, message: t('payment.error', lang) })
        setStep('complete')
      } else {
        const data = await res.json()
        setResult({ success: data.success, message: data.message, transactionId: data.transaction_id })
        setStep('complete')
      }
    } catch {
      setResult({ success: false, message: t('payment.error', lang) })
      setStep('complete')
    }
    setLoading(false)
  }

  function selectPlan(planId: string) {
    setSelectedPlan(planId)
    const plan = plans.find(p => p.id === planId)
    if (plan) setAmount(String(plan.price))
  }

  return (
    <div className="min-h-screen bg-bg-secondary px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2 text-center">
          {t('payment.title', lang)}
        </h1>
        <p className="text-[14px] text-text-secondary text-center mb-8">
          {t('payment.subtitle', lang)}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {plans.map(plan => (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all ${selectedPlan === plan.id ? 'border-accent-blue bg-bg-tertiary' : 'hover:border-border-strong'}`}
              onClick={() => selectPlan(plan.id)}
            >
              <h3 className="text-[16px] font-bold text-text-primary">{plan.name}</h3>
              <p className="text-[28px] font-bold text-text-primary mt-1">TSh {plan.price.toLocaleString()}</p>
              <p className="text-[12px] text-text-secondary mt-2">{plan.description}</p>
              {selectedPlan === plan.id && (
                <div className="mt-3 h-2 bg-accent-blue rounded" />
              )}
            </Card>
          ))}
        </div>

        {step === 'form' && (
          <Card className="max-w-md mx-auto">
            <h2 className="text-[16px] font-bold text-text-primary mb-6 text-center">
              {t('payment.checkout', lang)}
            </h2>
            <form onSubmit={handlePay} className="flex flex-col gap-4">
              <Input
                label={t('payment.phoneLabel', lang)}
                placeholder="07XXXXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
              <Input
                label={t('payment.amountLabel', lang)}
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
              <Button variant="primary" className="!h-12" disabled={loading}>
                {loading ? t('payment.processing', lang) : t('payment.payNow', lang)}
              </Button>
            </form>
          </Card>
        )}

        {step === 'processing' && (
          <Card className="text-center py-12">
            <div className="h-12 w-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-[18px] font-bold text-text-primary mb-2">
              {t('payment.processingTitle', lang)}
            </h3>
            <p className="text-text-secondary">{t('payment.processingDesc', lang)}</p>
          </Card>
        )}

        {step === 'complete' && result && (
          <Card className="text-center py-12">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.success ? 'bg-accent-green/10' : 'bg-accent-red/10'}`}>
              <span className="text-[32px]">{result.success ? '✓' : '✗'}</span>
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
            <Button variant="secondary" onClick={() => { setStep('form'); setResult(null); setPhone(''); setAmount('') }}>
              {t('payment.newPayment', lang)}
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}