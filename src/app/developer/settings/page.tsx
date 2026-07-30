'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  language: string
  created_at: string
}

export default function DeveloperSettingsPage() {
  const { lang, toggle } = useLanguage()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    fetch('/api/profile')
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(data => {
        setProfile(data)
        setName(data.full_name || '')
        setLoading(false)
      })
      .catch(() => {
        router.replace('/auth')
      })
  }, [router])

  function flashSaved(setter: (v: boolean) => void) {
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  async function handleSaveProfile() {
    if (!name.trim()) {
      setError(t('settings.nameRequired', lang))
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name.trim(), language: lang }),
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(prev => prev ? { ...prev, full_name: data.full_name, language: data.language } : prev)
        flashSaved(setSaved)
      } else {
        setError('Failed to save changes.')
      }
    } catch {
      setError('Network error.')
    }
    setSaving(false)
  }

  async function handleChangePassword() {
    setPwError('')
    setPwSaved(false)

    if (!currentPw || !newPw || !confirmPw) {
      setPwError(t('settings.passwordMismatch', lang))
      return
    }
    if (newPw.length < 8) {
      setPwError(t('settings.passwordTooShort', lang))
      return
    }
    if (newPw !== confirmPw) {
      setPwError(t('settings.passwordMismatch', lang))
      return
    }

    setPwSaving(true)
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      if (res.ok) {
        setCurrentPw('')
        setNewPw('')
        setConfirmPw('')
        flashSaved(setPwSaved)
      } else {
        const data = await res.json()
        setPwError(data.error === 'Current password is incorrect' ? t('settings.passwordWrong', lang) : 'Failed to update password.')
      }
    } catch {
      setPwError('Network error.')
    }
    setPwSaving(false)
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-bg-primary border border-border p-2 animate-pulse">
              <div className="h-3 bg-bg-tertiary w-1/3 mb-2" />
              <div className="h-2 bg-bg-tertiary w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h1 className="text-[clamp(18px,4vw,24px)] font-bold text-text-primary mb-3">{t('nav.settings', lang)}</h1>

      <div className="space-y-3">
        {profile && (
          <div className="bg-bg-primary border border-border p-2">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-[14px] font-bold text-text-primary">{profile.full_name}</h3>
                <p className="text-[11px] text-text-secondary">{profile.email}</p>
              </div>
              <Badge variant="info">{profile.role}</Badge>
            </div>
            <p className="text-[11px] text-text-secondary">
              {t('profile.joined', lang)} {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="bg-bg-primary border border-border p-2">
          <h2 className="text-[14px] font-bold text-text-primary mb-2">{t('settings.profile', lang)}</h2>
          <div className="space-y-2">
            <Input
              label={t('profile.fullName', lang)}
              value={name}
              onChange={e => setName(e.target.value)}
              error={error || undefined}
            />
            <Button variant="primary" onClick={handleSaveProfile} disabled={saving} loading={saving}>
              {saved ? t('settings.saved', lang) : t('settings.saveChanges', lang)}
            </Button>
          </div>
        </div>

        <div className="bg-bg-primary border border-border p-2">
          <h2 className="text-[14px] font-bold text-text-primary mb-2">{t('settings.changePassword', lang)}</h2>
          <div className="space-y-2">
            <Input
              label={t('settings.currentPassword', lang)}
              type="password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              autoComplete="current-password"
            />
            <Input
              label={t('settings.newPassword', lang)}
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              autoComplete="new-password"
            />
            <Input
              label={t('settings.confirmPassword', lang)}
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              error={pwError || undefined}
              autoComplete="new-password"
            />
            <Button variant="primary" onClick={handleChangePassword} disabled={pwSaving} loading={pwSaving}>
              {pwSaved ? t('settings.passwordUpdated', lang) : t('settings.updatePassword', lang)}
            </Button>
          </div>
        </div>

        <div className="bg-bg-primary border border-border p-2">
          <h2 className="text-[14px] font-bold text-text-primary mb-2">{t('settings.language', lang)}</h2>
          <p className="text-[12px] text-text-secondary mb-2">
            {t('settings.language', lang)}: {lang === 'en' ? 'English' : 'Kiswahili'}
          </p>
          <Button variant="secondary" onClick={toggle}>
            {t('settings.switchLang', lang)} {lang === 'en' ? 'Kiswahili' : 'English'}
          </Button>
        </div>
      </div>
    </div>
  )
}
