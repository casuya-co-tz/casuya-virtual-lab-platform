'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Table, Tr, Td } from '@/components/ui/Table'
import { EmptyState } from '@/components/shared/EmptyState'

interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  full_name?: string
}

export default function AdminAuditPage() {
  const { lang } = useLanguage()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (actionFilter) params.set('action', actionFilter)
    fetch(`/api/admin/audit?${params}`)
      .then(r => r.ok ? r.json() : { logs: [] })
      .then(data => { setLogs(Array.isArray(data.logs) ? data.logs : []); setLoading(false) })
      .catch(() => { setLogs([]); setLoading(false) })
  }, [page, actionFilter])

  function formatDate(d: string) {
    return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const actionColors: Record<string, string> = {
    login: 'text-accent-green',
    logout: 'text-accent-amber',
    create: 'text-accent-blue',
    update: 'text-accent-purple',
    delete: 'text-accent-red',
    api_key_create: 'text-accent-blue',
    api_key_revoke: 'text-accent-red',
  }

  return (
    <div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('admin.audit', lang)}</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'login', 'login_failed', 'logout', 'create', 'update', 'delete', 'api_key_create', 'api_key_revoke'].map(a => (
          <button
            key={a}
            onClick={() => { setActionFilter(a); setPage(1) }}
            className={`px-3 py-1.5 text-[12px] rounded-full border transition-colors ${
              actionFilter === a
                ? 'bg-accent-blue text-white border-accent-blue'
                : 'border-border-DEFAULT text-text-secondary hover:border-border-strong'
            }`}
          >
            {a || t('admin.all', lang)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-bg-tertiary animate-pulse rounded" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState title={t('admin.noAuditLogs', lang)} description={t('admin.auditEmptyDesc', lang)} />
      ) : (
        <>
          <Card>
            <Table headers={[t('admin.tableTime', lang), t('admin.tableUser', lang), t('admin.tableAction', lang), t('admin.tableEntity', lang), t('admin.tableIpAddress', lang)]}>
              {logs.map(log => (
                <Tr key={log.id}>
                  <Td>{formatDate(log.created_at)}</Td>
                  <Td>{log.full_name || log.user_id}</Td>
                  <Td>
                    <span className={`text-[12px] font-medium ${actionColors[log.action] || 'text-text-secondary'}`}>
                      {log.action}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-[12px] text-text-secondary">
                      {log.entity_type}{log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ''}
                    </span>
                  </Td>
                  <Td>{log.ip_address || '—'}</Td>
                </Tr>
              ))}
            </Table>
          </Card>
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-[13px] border border-border-DEFAULT rounded-lg disabled:opacity-40"
            >
              {t('admin.previous', lang)}
            </button>
            <span className="text-[13px] text-text-secondary py-2">{t('admin.page', lang)} {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={logs.length < 20}
              className="px-4 py-2 text-[13px] border border-border-DEFAULT rounded-lg disabled:opacity-40"
            >
              {t('admin.next', lang)}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
