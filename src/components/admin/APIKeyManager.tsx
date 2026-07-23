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
  public_token: string
  scopes: string[]
  is_active: boolean
  request_count: number
  last_used_at: string | null
  created_at: string
}

interface APIKeyManagerProps {
  keys: ApiKey[]
  onCreate: (scopes: string[]) => Promise<void>
  onRevoke: (id: string) => Promise<void>
}

export function APIKeyManager({ keys, onCreate, onRevoke }: APIKeyManagerProps) {
  const [scopesInput, setScopesInput] = useState('labs:read')
  const [creating, setCreating] = useState(false)
  const { lang } = useLanguage()

  async function handleCreate() {
    setCreating(true)
    await onCreate(scopesInput.split(',').map(s => s.trim()))
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-[14px] font-bold text-text-primary mb-3">{t('dev.createApiKey', lang)}</h3>
        <div className="flex gap-3">
          <Input
            label="Scopes (comma-separated)"
            value={scopesInput}
            onChange={e => setScopesInput(e.target.value)}
            className="flex-1"
          />
          <div className="flex items-end">
            <Button variant="primary" onClick={handleCreate} disabled={creating}>
              {creating ? t('auth.processing', lang) : t('dev.generateKey', lang)}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-[14px] font-bold text-text-primary mb-3">{t('dev.activeKeys', lang)}</h3>
        <Table headers={[t('dev.tableToken', lang), t('dev.tableScopes', lang), t('dev.tableRequests', lang), t('dev.tableLastUsed', lang), t('dev.tableActions', lang)]}>
          {keys.map(k => (
            <Tr key={k.id}>
              <Td><code className="text-[12px]">{k.public_token.slice(0, 12)}...</code></Td>
              <Td>{k.scopes.join(', ')}</Td>
              <Td>{k.request_count.toLocaleString()}</Td>
              <Td>{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : t('dev.never', lang)}</Td>
              <Td>
                <button onClick={() => onRevoke(k.id)} className="text-[12px] text-accent-red underline">
                  {t('dev.revoke', lang)}
                </button>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}
