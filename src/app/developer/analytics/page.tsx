'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
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
    <div className="min-h-screen bg-bg-secondary px-1 py-3">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h1 className="text-[clamp(18px,4vw,24px)] font-bold text-text-primary">{t('analytics.title', lang)}</h1>
          <div className="flex gap-2">
            <button onClick={() => exportData('csv')} className="px-2 py-1 rounded-lg text-[11px] font-bold bg-bg-primary border border-border text-text-secondary hover:border-border-strong">
              {t('analytics.exportCsv', lang)}
            </button>
            <button onClick={() => exportData('json')} className="px-2 py-1 rounded-lg text-[11px] font-bold bg-bg-primary border border-border text-text-secondary hover:border-border-strong">
              {t('analytics.exportJson', lang)}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-2 overflow-x-auto hide-scrollbar">
          {['7d', '30d', '90d'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-xl text-[12px] font-bold transition-all ${
                period === p ? 'bg-accent-blue text-white' : 'bg-bg-primary border border-border text-text-secondary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-text-secondary">{t('common.loading', lang)}</p>
        ) : !data ? (
          <div className="bg-bg-primary border border-border p-2 text-center py-3"><p className="text-text-secondary">{t('analytics.noData', lang)}</p></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <div className="bg-bg-primary border border-border p-2">
                <p className="text-[11px] uppercase text-text-secondary">{t('analytics.totalRequests', lang)}</p>
                <p className="text-[20px] sm:text-[24px] font-bold text-text-primary mt-1">{data.metrics?.total_requests?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-bg-primary border border-border p-2">
                <p className="text-[11px] uppercase text-text-secondary">{t('analytics.errorRate', lang)}</p>
                <p className="text-[20px] sm:text-[24px] font-bold text-text-primary mt-1">{data.metrics?.error_rate || 0}%</p>
              </div>
              <div className="bg-bg-primary border border-border p-2">
                <p className="text-[11px] uppercase text-text-secondary">{t('analytics.period', lang)}</p>
                <p className="text-[20px] sm:text-[24px] font-bold text-text-primary mt-1">{data.metrics?.period_days || 7}d</p>
              </div>
            </div>

            <h2 className="text-[14px] font-bold text-text-primary mb-2">{t('analytics.topEndpoints', lang)}</h2>
        <div className="bg-bg-primary border border-border p-2">
          <div className="-mx-4 sm:mx-0 overflow-x-auto">
            <div className="min-w-[800px] sm:min-w-0">
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
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
