'use client'
import { useEffect, useState, FormEvent } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  language: string
  created_at: string
}

export default function ProfilePage() {
  const { lang } = useLanguage()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [language, setLanguage] = useState('en')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => { setProfile(data); setFullName(data.full_name); setLanguage(data.language || 'en') })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaved(false)
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, language }),
    })
    if (res.ok) setSaved(true)
  }

  if (!profile) return <p className="text-text-secondary">{t('common.loading', lang)}</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('profile.title', lang)}</h1>
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[16px] font-bold text-text-primary">{profile.full_name}</h3>
            <p className="text-[12px] text-text-secondary">{profile.email}</p>
          </div>
          <Badge variant={profile.role === 'admin' ? 'info' : 'neutral'}>{profile.role}</Badge>
        </div>
        <p className="text-[12px] text-text-secondary">{t('profile.joined', lang)} {new Date(profile.created_at).toLocaleDateString()}</p>
      </Card>

      <Card>
        <h3 className="text-[16px] font-bold text-text-primary mb-4">{t('profile.editProfile', lang)}</h3>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input label={t('profile.fullName', lang)} value={fullName} onChange={e => setFullName(e.target.value)} />
          <label className="text-[12px] font-bold uppercase text-text-secondary">{t('profile.language', lang)}</label>
          <select
            className="w-full border border-border-DEFAULT bg-bg-primary text-text-primary p-3 text-[14px]"
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="sw">Swahili</option>
          </select>
          {saved && <p className="text-[12px] text-accent-green">{t('profile.saved', lang)}</p>}
          <Button variant="primary" type="submit">{t('settings.saveChanges', lang)}</Button>
        </form>
      </Card>
    </div>
  )
}
