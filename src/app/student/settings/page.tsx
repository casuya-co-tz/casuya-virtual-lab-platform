'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
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

export default function StudentSettingsPage() {
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

  const [emailNotifs, setEmailNotifs] = useState(true)
  const [labReminders, setLabReminders] = useState(true)
  const [gradeAlerts, setGradeAlerts] = useState(true)
  const [prefSaved, setPrefSaved] = useState(false)

  const [showClearCache, setShowClearCache] = useState(false)
  const [cacheCleared, setCacheCleared] = useState(false)

  const [showDelete, setShowDelete] = useState(false)
  const [deleteText, setDeleteText] = useState('')

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem('casuya-notif-prefs')
      if (saved) {
        const p = JSON.parse(saved)
        if (typeof p.emailNotifs === 'boolean') setEmailNotifs(p.emailNotifs)
        if (typeof p.labReminders === 'boolean') setLabReminders(p.labReminders)
        if (typeof p.gradeAlerts === 'boolean') setGradeAlerts(p.gradeAlerts)
      }
    } catch {}
  }, [])

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

  function handleSavePrefs() {
    localStorage.setItem('casuya-notif-prefs', JSON.stringify({ emailNotifs, labReminders, gradeAlerts }))
    flashSaved(setPrefSaved)
  }

  function handleClearCache() {
    const langVal = lang
    localStorage.clear()
    localStorage.setItem('casuya-lang', langVal)
    document.documentElement.setAttribute('lang', langVal)
    setShowClearCache(false)
    flashSaved(setCacheCleared)
  }

  async function handleDeleteAccount() {
    if (deleteText !== 'DELETE') return
    try {
      const res = await fetch('/api/profile', { method: 'DELETE' })
      if (res.ok) {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.replace('/')
      }
    } catch {}
    setShowDelete(false)
    setDeleteText('')
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-bg-tertiary w-1/3 mb-3" />
              <div className="h-3 bg-bg-tertiary w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('nav.settings', lang)}</h1>

      <div className="space-y-6">
        {profile && (
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[16px] font-bold text-text-primary">{profile.full_name}</h3>
                <p className="text-[12px] text-text-secondary">{profile.email}</p>
              </div>
              <Badge variant={profile.role === 'admin' ? 'info' : 'neutral'}>{profile.role}</Badge>
            </div>
            <p className="text-[12px] text-text-secondary">
              {t('profile.joined', lang)} {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </Card>
        )}

        <Card>
          <h2 className="text-[16px] font-bold text-text-primary mb-4">{t('settings.profile', lang)}</h2>
          <div className="space-y-4">
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
        </Card>

        <Card>
          <h2 className="text-[16px] font-bold text-text-primary mb-4">{t('settings.changePassword', lang)}</h2>
          <div className="space-y-4">
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
        </Card>

        <Card>
          <h2 className="text-[16px] font-bold text-text-primary mb-4">{t('settings.language', lang)}</h2>
          <p className="text-[14px] text-text-secondary mb-4">
            {t('settings.language', lang)}: {lang === 'en' ? 'English' : 'Kiswahili'}
          </p>
          <Button variant="secondary" onClick={toggle}>
            {t('settings.switchLang', lang)} {lang === 'en' ? 'Kiswahili' : 'English'}
          </Button>
        </Card>

        <Card>
          <h2 className="text-[16px] font-bold text-text-primary mb-4">{t('settings.notifications', lang)}</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-[14px] text-text-primary font-medium">{t('settings.emailNotifications', lang)}</p>
                <p className="text-[12px] text-text-secondary">{t('settings.emailNotificationsDesc', lang)}</p>
              </div>
              <button
                onClick={() => setEmailNotifs(!emailNotifs)}
                className={`relative w-10 h-6 transition-colors duration-200 ${emailNotifs ? 'bg-accent-blue' : 'bg-bg-tertiary border border-border-strong'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white transition-transform duration-200 ${emailNotifs ? 'translate-x-4' : ''}`} />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-[14px] text-text-primary font-medium">{t('settings.labReminders', lang)}</p>
                <p className="text-[12px] text-text-secondary">{t('settings.labRemindersDesc', lang)}</p>
              </div>
              <button
                onClick={() => setLabReminders(!labReminders)}
                className={`relative w-10 h-6 transition-colors duration-200 ${labReminders ? 'bg-accent-blue' : 'bg-bg-tertiary border border-border-strong'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white transition-transform duration-200 ${labReminders ? 'translate-x-4' : ''}`} />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-[14px] text-text-primary font-medium">{t('settings.gradeAlerts', lang)}</p>
                <p className="text-[12px] text-text-secondary">{t('settings.gradeAlertsDesc', lang)}</p>
              </div>
              <button
                onClick={() => setGradeAlerts(!gradeAlerts)}
                className={`relative w-10 h-6 transition-colors duration-200 ${gradeAlerts ? 'bg-accent-blue' : 'bg-bg-tertiary border border-border-strong'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white transition-transform duration-200 ${gradeAlerts ? 'translate-x-4' : ''}`} />
              </button>
            </label>

            <Button variant="primary" onClick={handleSavePrefs}>
              {prefSaved ? t('settings.preferencesSaved', lang) : t('settings.saveChanges', lang)}
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-[16px] font-bold text-text-primary mb-4">{t('settings.offline', lang)}</h2>
          <p className="text-[14px] text-text-secondary mb-4">{t('student.clearCacheDesc', lang)}</p>
          {showClearCache ? (
            <div className="space-y-3">
              <p className="text-[13px] text-text-secondary">{t('settings.clearCacheMsg', lang)}</p>
              <div className="flex gap-2">
                <Button variant="danger" onClick={handleClearCache}>
                  {t('common.confirm', lang)}
                </Button>
                <Button variant="ghost" onClick={() => setShowClearCache(false)}>
                  {t('common.cancel', lang)}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setShowClearCache(true)}>
              {cacheCleared ? t('student.clearCacheConfirm', lang) : t('student.clearCache', lang)}
            </Button>
          )}
        </Card>

        <Card className="border-accent-red/30">
          <h2 className="text-[16px] font-bold text-accent-red mb-2">{t('settings.deleteAccount', lang)}</h2>
          <p className="text-[13px] text-text-secondary mb-4">{t('settings.deleteAccountDesc', lang)}</p>
          {showDelete ? (
            <div className="space-y-3">
              <Input
                label={t('settings.deleteAccountConfirm', lang)}
                value={deleteText}
                onChange={e => setDeleteText(e.target.value)}
                placeholder="DELETE"
              />
              <div className="flex gap-2">
                <Button variant="danger" onClick={handleDeleteAccount} disabled={deleteText !== 'DELETE'}>
                  {t('settings.deleteAccount', lang)}
                </Button>
                <Button variant="ghost" onClick={() => { setShowDelete(false); setDeleteText('') }}>
                  {t('common.cancel', lang)}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              {t('settings.deleteAccount', lang)}
            </Button>
          )}
        </Card>
      </div>
    </div>
  )
}
