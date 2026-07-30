'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { APIKeyManager } from '@/components/admin/APIKeyManager'

interface ApiKey {
  id: string
  developer_id: string
  developer_name: string | null
  developer_email: string | null
  public_token: string
  scopes: string[]
  is_active: boolean
  request_count: number
  last_used_at: string | null
  created_at: string
}

interface Developer {
  id: string
  full_name: string
  email: string
}

export default function AdminApiKeysPage() {
  const { lang } = useLanguage()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyToken, setNewKeyToken] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/credentials').then(r => r.ok ? r.json() : []),
      fetch('/api/users').then(r => r.ok ? r.json() : []),
    ]).then(([creds, users]) => {
      setKeys(Array.isArray(creds) ? creds : [])
      const devs = Array.isArray(users)
        ? users.filter((u: { role: string }) => u.role === 'developer')
        : []
      setDevelopers(devs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleCreate(developerId: string, scopes: string[]) {
    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developer_id: developerId, scopes }),
      })
      if (res.ok) {
        const data = await res.json()
        setNewKeyToken(data.token || null)
        const cred = data.credential || data
        setKeys(prev => [cred, ...prev])
      }
    } catch {
      // Network error
    }
  }

  async function handleRevoke(id: string) {
    try {
      const res = await fetch(`/api/admin/credentials/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setKeys(prev => prev.map(k => k.id === id ? { ...k, is_active: false } : k))
      }
    } catch {
      // Network error
    }
  }

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  return (
    <div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('admin.apiKeys', lang)}</h1>
      <APIKeyManager
        keys={keys}
        developers={developers}
        onCreate={handleCreate}
        onRevoke={handleRevoke}
        newKeyToken={newKeyToken}
        onDismissToken={() => setNewKeyToken(null)}
      />
    </div>
  )
}
