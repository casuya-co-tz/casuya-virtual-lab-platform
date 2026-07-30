'use client'
import { useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function RecoveryPage() {
  const { lang } = useLanguage()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || t('auth.networkError', lang))
      } else {
        setSent(true)
      }
    } catch {
      setError(t('auth.networkError', lang))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary px-2 py-4">
      <div className="w-full max-w-sm bg-bg-primary border border-border p-4 sm:p-6">
        <h1 className="text-[clamp(18px,4vw,24px)] font-bold text-text-primary mb-1">{t('auth.recovery', lang)}</h1>
        <p className="text-[12px] sm:text-[13px] text-text-secondary mb-4">{t('auth.resetDesc', lang)}</p>
        {sent ? (
          <p className="text-[12px] sm:text-[13px] text-accent-green">{t('auth.resetSent', lang)}</p>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <Input label={t('auth.email', lang)} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <p className="text-[11px] text-accent-red">{error}</p>}
            <Button variant="primary" className="!h-10 !w-full" disabled={loading}>
              {loading ? t('auth.sending', lang) : t('auth.sendResetLink', lang)}
            </Button>
          </form>
        )}
        <div className="mt-3 text-center">
          <a href="/auth" className="text-[11px] text-accent-blue underline">{t('auth.backToLogin', lang)}</a>
        </div>
      </div>
    </div>
  )
}
