'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { APIKeyManager } from '@/components/admin/APIKeyManager'
import { EmptyState } from '@/components/shared/EmptyState'

interface ApiKey {
  id: string
  public_token: string
  scopes: string[]
  is_active: boolean
  request_count: number
  last_used_at: string | null
  created_at: string
}

export default function AdminApiKeysPage() {
  const { lang } = useLanguage()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/developer/credentials')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setKeys(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleCreate(scopes: string[]) {
    const res = await fetch('/api/developer/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scopes }),
    })
    if (res.ok) {
      const newKey = await res.json()
      setKeys(prev => [...prev, newKey])
    }
  }

  async function handleRevoke(id: string) {
    await fetch(`/api/developer/credentials/${id}`, { method: 'DELETE' })
    setKeys(prev => prev.filter(k => k.id !== id))
  }

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  return (
    <div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('admin.apiKeys', lang)}</h1>
      <APIKeyManager keys={keys} onCreate={handleCreate} onRevoke={handleRevoke} />
    </div>
  )
}
