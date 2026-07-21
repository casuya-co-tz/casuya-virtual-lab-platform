'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLanguage } from '@/hooks/useLanguage'

export default function StudentSettingsPage() {
  const { lang, toggle } = useLanguage()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setName(data.full_name || '') })
      .catch(() => {})
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, language: lang }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <h2 className="text-[16px] font-bold text-text-primary mb-4">Profile</h2>
          <div className="space-y-4">
            <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-[16px] font-bold text-text-primary mb-4">Language</h2>
          <p className="text-[14px] text-text-secondary mb-4">Current: {lang === 'en' ? 'English' : 'Kiswahili'}</p>
          <Button variant="secondary" onClick={toggle}>
            Switch to {lang === 'en' ? 'Kiswahili' : 'English'}
          </Button>
        </Card>

        <Card>
          <h2 className="text-[16px] font-bold text-text-primary mb-4">Offline Data</h2>
          <p className="text-[14px] text-text-secondary mb-4">Lab progress is cached locally for offline use and syncs when you reconnect.</p>
          <Button variant="ghost">Clear Local Cache</Button>
        </Card>
      </div>
    </div>
  )
}
