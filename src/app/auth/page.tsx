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
  const [role, setRole] = useState<'student' | 'developer'>(
    searchParams.get('role') === 'developer' ? 'developer' : 'student'
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup'
      const schoolId = searchParams.get('school_id')
      const body = mode === 'login' ? { email, password } : { email, password, fullName, role, schoolId }
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
      const dest = data.user.role === 'admin' ? '/admin' : data.user.role === 'developer' ? '/developer' : data.user.role === 'teacher' ? '/teacher' : '/student'
      router.push(redirect || dest)
      router.refresh()
    } catch {
      setError(t('auth.networkError', lang))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary px-2 py-4">
      <div className="w-full max-w-sm bg-bg-primary border border-border p-4 sm:p-6">
        <h1 className="text-[clamp(18px,4vw,24px)] font-bold text-text-primary mb-1">
          {mode === 'login' ? t('auth.login', lang) : t('auth.signup', lang)}
        </h1>
        <p className="text-[12px] sm:text-[13px] text-text-secondary mb-4">
          {mode === 'login' ? t('auth.welcomeBack', lang) : t('auth.createYourAccount', lang)}
        </p>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <Input label={t('auth.fullName', lang)} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <div className="flex gap-3 mb-1 flex-wrap">
                <label className="flex items-center gap-1.5 cursor-pointer text-[12px] sm:text-[13px] text-text-primary">
                  <input type="radio" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} className="accent-accent-blue" />
                  Student
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[12px] sm:text-[13px] text-text-primary">
                  <input type="radio" name="role" value="developer" checked={role === 'developer'} onChange={() => setRole('developer')} className="accent-accent-blue" />
                  Developer
                </label>
              </div>
              <p className="text-[11px] text-text-secondary -mt-1">
                {lang === 'sw' ? 'Akaunti za walimu hutengenezwa na msimamizi.' : 'Teacher accounts are created by an administrator.'}
              </p>
            </>
          )}
          <Input label={t('auth.email', lang)} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label={t('auth.password', lang)} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-[11px] text-accent-red">{error}</p>}
          <Button variant="primary" className="!h-10 !w-full" disabled={loading}>
            {loading ? t('auth.processing', lang) : mode === 'login' ? t('auth.login', lang) : t('auth.createAccount', lang)}
          </Button>
        </form>
        <p className="text-[11px] text-text-secondary text-center mt-3">
          {mode === 'login' ? (
            <>{t('auth.noAccount', lang)} <button onClick={() => setMode('signup')} className="text-accent-blue underline">{t('auth.signup', lang)}</button></>
          ) : (
            <>{t('auth.hasAccount', lang)} <button onClick={() => setMode('login')} className="text-accent-blue underline">{t('auth.login', lang)}</button></>
          )}
        </p>
        <div className="mt-3 text-center">
          <a href="/auth/recovery" className="text-[11px] text-accent-blue underline">{t('auth.forgotPassword', lang)}</a>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg-secondary px-2"><div className="w-full max-w-sm bg-bg-primary border border-border p-4 text-center text-text-secondary">Loading...</div></div>}>
      <AuthForm />
    </Suspense>
  )
}
