'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, Tr, Td } from '@/components/ui/Table'

interface AnalyticsData {
  metrics: { total_requests: number; error_rate: number; period_days: number }
  timeline: Array<{ day: string; requests: number }>
  topEndpoints: Array<{ endpoint: string; status_code: number; count: string }>
}

export default function AnalyticsPage() {
  const { lang } = useLanguage()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/developer/analytics?period=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [period])

  async function exportData(format: string) {
    window.open(`/api/developer/analytics/export?format=${format}&period=${period}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-bg-secondary px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary">{t('analytics.title', lang)}</h1>
          <div className="flex gap-2">
            <button onClick={() => exportData('csv')} className="px-3 py-1.5 rounded-lg text-[12px] font-bold bg-bg-primary border border-border-default text-text-secondary hover:border-border-strong">
              {t('analytics.exportCsv', lang)}
            </button>
            <button onClick={() => exportData('json')} className="px-3 py-1.5 rounded-lg text-[12px] font-bold bg-bg-primary border border-border-default text-text-secondary hover:border-border-strong">
              {t('analytics.exportJson', lang)}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {['7d', '30d', '90d'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
                period === p ? 'bg-accent-blue text-white' : 'bg-bg-primary border border-border-default text-text-secondary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-text-secondary">{t('common.loading', lang)}</p>
        ) : !data ? (
          <Card className="text-center py-12"><p className="text-text-secondary">{t('analytics.noData', lang)}</p></Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <p className="text-[12px] uppercase text-text-secondary">{t('analytics.totalRequests', lang)}</p>
                <p className="text-[28px] font-bold text-text-primary mt-1">{data.metrics?.total_requests?.toLocaleString() || 0}</p>
              </Card>
              <Card>
                <p className="text-[12px] uppercase text-text-secondary">{t('analytics.errorRate', lang)}</p>
                <p className="text-[28px] font-bold text-text-primary mt-1">{data.metrics?.error_rate || 0}%</p>
              </Card>
              <Card>
                <p className="text-[12px] uppercase text-text-secondary">{t('analytics.period', lang)}</p>
                <p className="text-[28px] font-bold text-text-primary mt-1">{data.metrics?.period_days || 7}d</p>
              </Card>
            </div>

            <h2 className="text-[16px] font-bold text-text-primary mb-4">{t('analytics.topEndpoints', lang)}</h2>
            <Card>
              <Table headers={['Endpoint', 'Status', 'Count']}>
                {data.topEndpoints?.map((ep, i) => (
                  <Tr key={i}>
                    <Td><code className="text-[12px] font-mono">{ep.endpoint}</code></Td>
                    <Td>
                      <Badge variant={ep.status_code < 400 ? 'success' : 'danger'}>{ep.status_code}</Badge>
                    </Td>
                    <Td>{parseInt(ep.count).toLocaleString()}</Td>
                  </Tr>
                ))}
              </Table>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
