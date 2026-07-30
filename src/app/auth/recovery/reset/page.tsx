'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function RecoveryResetPage() {
  const { lang } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!token) {
      setError(lang === 'sw' ? 'Kiungo cha urejeshaji hakipo.' : 'Missing reset token.')
      return
    }
    if (password.length < 8) {
      setError(lang === 'sw' ? 'Nywila lazima iwe angalau herufi 8.' : 'Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError(lang === 'sw' ? 'Nywila hazilingani.' : 'Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/recovery/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || t('auth.networkError', lang))
      } else {
        setDone(true)
        setTimeout(() => router.push('/auth'), 2000)
      }
    } catch {
      setError(t('auth.networkError', lang))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary px-2 py-4">
      <div className="w-full max-w-sm bg-bg-primary border border-border p-4 sm:p-6">
        <h1 className="text-[clamp(18px,4vw,24px)] font-bold text-text-primary mb-1">
          {lang === 'sw' ? 'Weka Nywila Mpya' : 'Set New Password'}
        </h1>
        {done ? (
          <p className="text-[12px] sm:text-[13px] text-accent-green">
            {lang === 'sw' ? 'Nywila imesasishwa. Inaelekeza kwenye kuingia...' : 'Password updated. Redirecting to login...'}
          </p>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <Input
              label={lang === 'sw' ? 'Nywila Mpya' : 'New Password'}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label={lang === 'sw' ? 'Thibitisha Nywila' : 'Confirm Password'}
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {error && <p className="text-[11px] text-accent-red">{error}</p>}
            <Button variant="primary" className="!h-10 !w-full" disabled={loading}>
              {loading ? t('common.loading', lang) : (lang === 'sw' ? 'Hifadhi Nywila' : 'Save Password')}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
