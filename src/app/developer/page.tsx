'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, Tr, Td } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'

interface Credential {
  id: string
  public_token: string
  scopes: string[]
  is_active: boolean
  expires_at: string | null
  request_count: number
  last_used_at: string | null
  created_at: string
}

interface DevProfile {
  company_or_school: string
  api_tier: string
  monthly_request_limit: number
  max_api_keys: number | null
  created_at: string
}

export default function DeveloperPage() {
  const { lang } = useLanguage()
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [devProfile, setDevProfile] = useState<DevProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTokenName, setNewTokenName] = useState('')
  const [newToken, setNewToken] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/developer/profile').then(r => r.ok ? r.json() : null),
      fetch('/api/developer/credentials').then(r => r.ok ? r.json() : []),
    ]).then(([profile, creds]) => {
      setDevProfile(profile)
      setCredentials(Array.isArray(creds) ? creds : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleCreate() {
    setError('')
    setNewToken(null)
    const res = await fetch('/api/developer/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scopes: ['labs:read'] }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || t('dev.failedCreate', lang)); return }
    setNewToken(data.token)
    setCredentials([data.credential, ...credentials])
    setShowCreate(false)
  }

  async function handleRevoke(id: string) {
    if (!confirm(t('dev.revokeConfirm', lang))) return
    const res = await fetch(`/api/developer/credentials/${id}`, { method: 'DELETE' })
    if (res.ok) setCredentials(credentials.filter(c => c.id !== id))
  }

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  if (!devProfile) {
    return (
      <div className="w-full">
        <h1 className="text-[clamp(18px,4vw,24px)] font-bold text-text-primary mb-2">{t('dev.portal', lang)}</h1>
        <div className="bg-bg-primary border border-border p-2">
          <h3 className="text-[14px] font-bold text-text-primary mb-1">{t('dev.notADeveloper', lang)}</h3>
          <p className="text-[12px] text-text-secondary mb-2">{t('dev.notADeveloperDesc', lang)}</p>
          <Button variant="primary" onClick={async () => {
            await fetch('/api/developer/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_or_school: 'Independent' }) })
            window.location.reload()
          }}>{t('dev.register', lang)}</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div>
          <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary">{t('dev.portal', lang)}</h1>
          <p className="text-[12px] text-text-secondary">{devProfile.company_or_school} &middot; {devProfile.api_tier}</p>
        </div>
        {devProfile.max_api_keys !== null && credentials.filter(c => c.is_active).length >= devProfile.max_api_keys ? (
          <a href="/pricing?section=developer" className="block sm:inline-block w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">{t('dev.upgradeForMoreKeys', lang)}</Button>
          </a>
        ) : (
          <Button variant="primary" onClick={() => setShowCreate(true)} className="w-full sm:w-auto">{t('dev.newApiKey', lang)}</Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
        <div className="bg-bg-primary border border-border p-2"><p className="text-[11px] uppercase text-text-secondary">{t('dev.tier', lang)}</p><p className="text-[16px] sm:text-[18px] font-bold text-text-primary mt-1">{devProfile.api_tier}</p></div>
        <div className="bg-bg-primary border border-border p-2"><p className="text-[11px] uppercase text-text-secondary">{t('dev.monthlyLimit', lang)}</p><p className="text-[16px] sm:text-[18px] font-bold text-text-primary mt-1">{devProfile.monthly_request_limit.toLocaleString()}</p></div>
        <div className="bg-bg-primary border border-border p-2"><p className="text-[11px] uppercase text-text-secondary">{t('dev.activeKeys', lang)}</p><p className="text-[16px] sm:text-[18px] font-bold text-text-primary mt-1">{credentials.filter(c => c.is_active).length}</p></div>
      </div>

      {showCreate && (
        <div className="bg-bg-primary border border-border p-2 mb-2">
          <h3 className="text-[14px] font-bold text-text-primary mb-2">{t('dev.createApiKey', lang)}</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="primary" onClick={handleCreate} className="w-full sm:w-auto">{t('dev.generateKey', lang)}</Button>
            <Button variant="secondary" onClick={() => setShowCreate(false)} className="w-full sm:w-auto">{t('common.cancel', lang)}</Button>
          </div>
          {error && <p className="text-[12px] text-accent-red mt-2">{error}</p>}
        </div>
      )}

      {newToken && (
        <div className="bg-bg-primary border border-border p-2 mb-2 border-accent-green">
          <h3 className="text-[14px] font-bold text-accent-green mb-1">{t('dev.apiKeyCreated', lang)}</h3>
          <p className="text-[11px] text-text-secondary mb-1">{t('dev.copyKey', lang)}</p>
          <code className="block p-2 bg-bg-secondary border border-border text-[12px] text-text-primary font-mono break-all">{newToken}</code>
        </div>
      )}

      <h2 className="text-[14px] font-bold text-text-primary mb-2">{t('dev.portal', lang)}</h2>
      <div className="bg-bg-primary border border-border p-2">
        <div className="-mx-4 sm:mx-0 overflow-x-auto">
        <Table headers={[t('dev.tableToken', lang), t('dev.tableScopes', lang), t('dev.tableStatus', lang), t('dev.tableRequests', lang), t('dev.tableLastUsed', lang), t('dev.tableActions', lang)]}>
          {credentials.map(c => (
            <Tr key={c.id}>
              <Td><code className="text-[12px] font-mono">{c.public_token.slice(0, 12)}...</code></Td>
              <Td>{c.scopes?.join(', ')}</Td>
              <Td><Badge variant={c.is_active ? 'success' : 'neutral'}>{c.is_active ? t('dev.active', lang) : t('dev.revoked', lang)}</Badge></Td>
              <Td>{c.request_count}</Td>
              <Td>{c.last_used_at ? new Date(c.last_used_at).toLocaleDateString() : t('dev.never', lang)}</Td>
              <Td>
                {c.is_active && <button onClick={() => handleRevoke(c.id)} className="text-[12px] text-accent-red underline">{t('dev.revoke', lang)}</button>}
              </Td>
            </Tr>
          ))}
        </Table>
        </div>
      </div>
    </div>
  )
}
