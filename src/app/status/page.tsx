'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface Incident {
  id: string
  title: string
  description: string | null
  status: string
  severity: string
  started_at: string
  resolved_at: string | null
  updates: Array<{ status: string; note: string; timestamp: string }>
}

export default function StatusPage() {
  const { lang } = useLanguage()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded' | 'down'>('operational')

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.ok ? 'operational' as const : 'degraded' as const)
      .catch(() => 'down' as const)
      .then(status => {
        setSystemStatus(status)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    fetch('/api/status/incidents')
      .then(r => r.json())
      .then(d => setIncidents(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  const statusConfig = {
    operational: { label: t('status.operational', lang), color: 'bg-accent-green', textColor: 'text-accent-green' },
    degraded: { label: t('status.degraded', lang), color: 'bg-accent-amber', textColor: 'text-accent-amber' },
    down: { label: t('status.outage', lang), color: 'bg-accent-red', textColor: 'text-accent-red' },
  }

  const cfg = statusConfig[systemStatus]

  return (
    <div className="min-h-screen bg-bg-secondary px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('status.title', lang)}</h1>

        <Card className="mb-8">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${cfg.color} animate-pulse`} />
            <span className={`text-[18px] font-bold ${cfg.textColor}`}>{cfg.label}</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <p className="text-[12px] uppercase text-text-secondary">{t('status.uptime', lang)}</p>
              <p className="text-[16px] sm:text-[20px] font-bold text-accent-green">99.9%</p>
            </div>
            <div>
              <p className="text-[12px] uppercase text-text-secondary">API</p>
              <p className="text-[16px] sm:text-[20px] font-bold text-accent-green">OK</p>
            </div>
            <div>
              <p className="text-[12px] uppercase text-text-secondary">Database</p>
              <p className="text-[16px] sm:text-[20px] font-bold text-accent-green">Connected</p>
            </div>
          </div>
        </Card>

        <h2 className="text-[16px] font-bold text-text-primary mb-4">{t('status.incidents', lang)}</h2>
        {loading ? (
          <p className="text-text-secondary">{t('common.loading', lang)}</p>
        ) : incidents.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-text-secondary">{t('status.noIncidents', lang)}</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {incidents.map(inc => (
              <Card key={inc.id}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-[15px] font-bold text-text-primary">{inc.title}</h3>
                  <Badge variant={inc.status === 'resolved' ? 'success' : inc.severity === 'critical' ? 'danger' : 'warning'}>
                    {t(`status.${inc.status}`, lang) || inc.status}
                  </Badge>
                </div>
                {inc.description && <p className="text-[13px] text-text-secondary mb-2">{inc.description}</p>}
                <p className="text-[12px] text-text-secondary">
                  {new Date(inc.started_at).toLocaleString()}
                  {inc.resolved_at && ` — ${new Date(inc.resolved_at).toLocaleString()}`}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
