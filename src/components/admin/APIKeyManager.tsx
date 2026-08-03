'use client'
import { useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Table, Tr, Td } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'

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

interface APIKeyManagerProps {
  keys: ApiKey[]
  developers: Developer[]
  onCreate: (developerId: string, scopes: string[]) => Promise<void>
  onRevoke: (id: string) => Promise<void>
  newKeyToken: string | null
  onDismissToken: () => void
}

export function APIKeyManager({ keys, developers, onCreate, onRevoke, newKeyToken, onDismissToken }: APIKeyManagerProps) {
  const [scopesInput, setScopesInput] = useState('labs:read')
  const [selectedDev, setSelectedDev] = useState('')
  const [creating, setCreating] = useState(false)
  const { lang } = useLanguage()

  async function handleCreate() {
    if (!selectedDev) return
    setCreating(true)
    await onCreate(selectedDev, scopesInput.split(',').map(s => s.trim()))
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      {newKeyToken && (
        <Card className="border-accent-green/40 bg-accent-green/5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[14px] font-bold text-text-primary mb-2">
                {lang === 'sw' ? 'Ufunguo Mpya Umekutwa' : 'New API Key Generated'}
              </h3>
              <p className="text-[12px] text-text-secondary mb-3">
                {lang === 'sw' ? 'Hifadhi hii sasa — huwekuonyesha tena.' : 'Save this now — it won\'t be shown again.'}
              </p>
              <code className="block p-3 bg-bg-primary rounded text-[13px] text-text-primary break-all font-mono">
                {newKeyToken}
              </code>
            </div>
            <button onClick={onDismissToken} className="text-text-secondary hover:text-text-primary text-[18px] ml-4">
              x
            </button>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-[14px] font-bold text-text-primary mb-3">{t('admin.createApiKey', lang)}</h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-[13px] text-text-secondary mb-1 block">{t('admin.developer', lang)}</label>
            <select
              value={selectedDev}
              onChange={e => setSelectedDev(e.target.value)}
              className="w-full h-[clamp(40px,5vw,44px)] px-3 rounded-lg border border-border bg-bg-primary text-text-primary text-[14px]"
            >
              <option value="">
                {developers.length === 0
                  ? (lang === 'sw' ? 'Hakuna wasanidi' : 'No developers found')
                  : (lang === 'sw' ? 'Chagua msanidi...' : 'Select developer...')
                }
              </option>
              {developers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.full_name} ({d.email})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <Input
              label="Scopes (comma-separated)"
              value={scopesInput}
              onChange={e => setScopesInput(e.target.value)}
            />
          </div>
          <Button variant="primary" onClick={handleCreate} disabled={creating || !selectedDev} className="w-full sm:w-auto">
            {creating ? t('auth.processing', lang) : t('dev.generateKey', lang)}
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-[14px] font-bold text-text-primary mb-3">
          {lang === 'sw' ? 'Ufunguo Wote' : 'All API Keys'} ({keys.length})
        </h3>
        <div className="-mx-4 sm:mx-0 overflow-x-auto">
        <Table headers={[
          t('admin.developer', lang),
          t('dev.tableToken', lang),
          t('dev.tableScopes', lang),
          'Status',
          t('dev.tableRequests', lang),
          t('dev.tableLastUsed', lang),
          t('dev.tableActions', lang),
        ]}>
          {keys.length === 0 && (
            <Tr>
              <Td colSpan={7}>
                <span className="text-text-secondary text-[13px]">
                  {lang === 'sw' ? 'Hakuna ufunguo bado' : 'No keys yet'}
                </span>
              </Td>
            </Tr>
          )}
          {keys.map(k => (
            <Tr key={k.id}>
              <Td>
                <div>
                  <p className="text-[13px] font-medium text-text-primary">{k.developer_name || 'Unknown'}</p>
                  {k.developer_email && <p className="text-[11px] text-text-secondary">{k.developer_email}</p>}
                </div>
              </Td>
              <Td><code className="text-[12px]">{k.public_token.slice(0, 16)}...</code></Td>
              <Td className="text-[12px]">{k.scopes.join(', ')}</Td>
              <Td>
                <Badge variant={k.is_active ? 'success' : 'danger'}>
                  {k.is_active ? 'Active' : 'Revoked'}
                </Badge>
              </Td>
              <Td>{k.request_count.toLocaleString()}</Td>
              <Td className="text-[12px]">{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : t('dev.never', lang)}</Td>
              <Td>
                {k.is_active && (
                  <button onClick={() => onRevoke(k.id)} className="text-[12px] text-accent-red underline">
                    {t('dev.revoke', lang)}
                  </button>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
        </div>
      </Card>
    </div>
  )
}
