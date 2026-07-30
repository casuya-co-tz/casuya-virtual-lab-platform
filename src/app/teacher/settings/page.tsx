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

export default function TeacherSettingsPage() {
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

  const [subscription, setSubscription] = useState<{ tier: string; status: string; expires_at: string | null; plan_name: string } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then(r => { if (!r.ok) throw new Error(); return r.json() }),
      fetch('/api/subscription').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([profileData, subData]) => {
      setProfile(profileData)
      setName(profileData.full_name || '')
      if (subData?.subscription) {
        setSubscription({
          tier: subData.subscription.tier,
          status: subData.subscription.status,
          expires_at: subData.subscription.expires_at,
          plan_name: subData.plan?.name || subData.subscription.tier,
        })
      }
      setLoading(false)
    }).catch(() => {
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

  if (loading) {
    return (
      <div className="w-full">
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-bg-primary border border-border p-2">
              <div className="h-3 bg-bg-tertiary w-1/3 mb-2" />
              <div className="h-2 bg-bg-tertiary w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-1 sm:px-0">
      <h1 className="text-[clamp(18px,4vw,24px)] font-bold text-text-primary mb-3">{t('nav.settings', lang)}</h1>

      <div className="space-y-3">
        {profile && (
          <div className="bg-bg-primary border border-border p-2">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-[13px] font-bold text-text-primary">{profile.full_name}</h3>
                <p className="text-[10px] text-text-secondary">{profile.email}</p>
              </div>
              <Badge variant="info">{profile.role}</Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[10px] text-text-secondary">
                {t('profile.joined', lang)} {new Date(profile.created_at).toLocaleDateString()}
              </p>
              {subscription && (
                <div className="flex items-center gap-2">
                  <Badge variant={subscription.tier === 'free' ? 'neutral' : subscription.tier === 'enterprise' ? 'info' : 'success'}>
                    {subscription.plan_name}
                  </Badge>
                  {subscription.expires_at && (
                    <span className="text-[9px] text-text-secondary">
                      {lang === 'sw' ? 'Inaisha' : 'Expires'} {new Date(subscription.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
            {subscription && subscription.tier !== 'free' && (
              <div className="mt-2 pt-2 border-t border-border">
                <a href="/pricing" className="text-[10px] text-accent-blue underline">
                  {lang === 'sw' ? 'Badilisha Mpango' : 'Manage Subscription'}
                </a>
              </div>
            )}
          </div>
        )}

        <div className="bg-bg-primary border border-border p-2">
          <h2 className="text-[13px] font-bold text-text-primary mb-2">{t('settings.profile', lang)}</h2>
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
        </div>

        <div className="bg-bg-primary border border-border p-2">
          <h2 className="text-[13px] font-bold text-text-primary mb-2">{t('settings.changePassword', lang)}</h2>
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
          <h2 className="text-[13px] font-bold text-text-primary mb-2">{t('settings.language', lang)}</h2>
          <p className="text-[12px] text-text-secondary mb-2">
            {t('settings.language', lang)}: {lang === 'en' ? 'English' : 'Kiswahili'}
          </p>
          <Button variant="secondary" onClick={toggle}>
            {t('settings.switchLang', lang)} {lang === 'en' ? 'Kiswahili' : 'English'}
          </Button>
        </div>

        <div className="bg-bg-primary border border-border p-2">
          <h2 className="text-[13px] font-bold text-text-primary mb-2">{t('settings.notifications', lang)}</h2>
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-[12px] text-text-primary font-medium">{t('settings.emailNotifications', lang)}</p>
                <p className="text-[10px] text-text-secondary">{t('settings.emailNotificationsDesc', lang)}</p>
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
                <p className="text-[12px] text-text-primary font-medium">{t('settings.labReminders', lang)}</p>
                <p className="text-[10px] text-text-secondary">{t('settings.labRemindersDesc', lang)}</p>
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
                <p className="text-[12px] text-text-primary font-medium">{t('settings.gradeAlerts', lang)}</p>
                <p className="text-[10px] text-text-secondary">{t('settings.gradeAlertsDesc', lang)}</p>
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
        </div>
      </div>
    </div>
  )
}
