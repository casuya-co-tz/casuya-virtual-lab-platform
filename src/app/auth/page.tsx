'use client'
import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const { lang } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup'
      const body = mode === 'login' ? { email, password } : { email, password, fullName }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t('auth.somethingWrong', lang))
        return
      }
      router.push(redirect || (data.user.role === 'admin' ? '/admin' : '/student'))
      router.refresh()
    } catch {
      setError(t('auth.networkError', lang))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary px-4">
      <div className="w-full max-w-md bg-bg-primary border border-border-DEFAULT p-8">
        <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2">
          {mode === 'login' ? t('auth.login', lang) : t('auth.signup', lang)}
        </h1>
        <p className="text-[14px] text-text-secondary mb-6">
          {mode === 'login' ? t('auth.welcomeBack', lang) : t('auth.createYourAccount', lang)}
        </p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <Input label={t('auth.fullName', lang)} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          )}
          <Input label={t('auth.email', lang)} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label={t('auth.password', lang)} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-[12px] text-accent-red">{error}</p>}
          <Button variant="primary" className="!h-[52px] !w-full" disabled={loading}>
            {loading ? t('auth.processing', lang) : mode === 'login' ? t('auth.login', lang) : t('auth.createAccount', lang)}
          </Button>
        </form>
        <p className="text-[12px] text-text-secondary text-center mt-4">
          {mode === 'login' ? (
            <>{t('auth.noAccount', lang)} <button onClick={() => setMode('signup')} className="text-accent-blue underline">{t('auth.signup', lang)}</button></>
          ) : (
            <>{t('auth.hasAccount', lang)} <button onClick={() => setMode('login')} className="text-accent-blue underline">{t('auth.login', lang)}</button></>
          )}
        </p>
        <div className="mt-4 text-center">
          <a href="/auth/recovery" className="text-[12px] text-accent-blue underline">{t('auth.forgotPassword', lang)}</a>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg-secondary px-4"><div className="w-full max-w-md bg-bg-primary border border-border-DEFAULT p-8 text-center text-text-secondary">Loading...</div></div>}>
      <AuthForm />
    </Suspense>
  )
}
