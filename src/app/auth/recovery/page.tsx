'use client'
import { useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'

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
      const { error: supaError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      })
      if (supaError) {
        setError(supaError.message)
      } else {
        setSent(true)
      }
    } catch {
      setError(t('auth.networkError', lang))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary px-4">
      <div className="w-full max-w-md bg-bg-primary border border-border-default p-8">
        <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2">{t('auth.recovery', lang)}</h1>
        <p className="text-[14px] text-text-secondary mb-6">{t('auth.resetDesc', lang)}</p>
        {sent ? (
          <p className="text-[14px] text-accent-green">{t('auth.resetSent', lang)}</p>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input label={t('auth.email', lang)} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <p className="text-[12px] text-accent-red">{error}</p>}
            <Button variant="primary" className="!h-[52px] !w-full" disabled={loading}>
              {loading ? t('auth.sending', lang) : t('auth.sendResetLink', lang)}
            </Button>
          </form>
        )}
        <div className="mt-4 text-center">
          <a href="/auth" className="text-[12px] text-accent-blue underline">{t('auth.backToLogin', lang)}</a>
        </div>
      </div>
    </div>
  )
}
