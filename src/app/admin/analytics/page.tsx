'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Table, Tr, Td } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'

interface Stats {
  total_students: number
  total_labs: number
  published_labs: number
  total_progress: number
  completed_labs: number
  avg_score: number
}

interface RecentActivity {
  full_name: string
  title: string
  subject: string
  status: string
  score: number
  last_server_ts: string
}

export default function AnalyticsPage() {
  const { lang } = useLanguage()
  const [stats, setStats] = useState<Stats | null>(null)
  const [activity, setActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/activity').then(r => r.ok ? r.json() : []),
    ]).then(([s, a]) => {
      setStats(s)
      setActivity(Array.isArray(a) ? a : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  return (
    <div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2">{t('admin.analytics', lang)}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3">
          <div className="bg-bg-primary border border-border p-2"><p className="text-[11px] uppercase text-text-secondary">{t('stats.students', lang)}</p><p className="text-[18px] sm:text-[20px] font-bold text-text-primary mt-1">{stats?.total_students ?? 0}</p></div>
          <div className="bg-bg-primary border border-border p-2"><p className="text-[11px] uppercase text-text-secondary">{t('admin.publishedLabs', lang)}</p><p className="text-[18px] sm:text-[20px] font-bold text-text-primary mt-1">{stats?.published_labs ?? 0}/{stats?.total_labs ?? 0}</p></div>
          <div className="bg-bg-primary border border-border p-2"><p className="text-[11px] uppercase text-text-secondary">{t('admin.completionRate', lang)}</p><p className="text-[18px] sm:text-[20px] font-bold text-text-primary mt-1">{stats?.total_progress ? Math.round((stats.completed_labs / stats.total_progress) * 100) : 0}%</p></div>
          <div className="bg-bg-primary border border-border p-2"><p className="text-[11px] uppercase text-text-secondary">{t('admin.avgScore', lang)}</p><p className="text-[18px] sm:text-[20px] font-bold text-text-primary mt-1">{stats?.avg_score?.toFixed(1) ?? '0.0'}</p></div>
          <div className="bg-bg-primary border border-border p-2"><p className="text-[11px] uppercase text-text-secondary">{t('admin.totalAttempts', lang)}</p><p className="text-[18px] sm:text-[20px] font-bold text-text-primary mt-1">{stats?.total_progress ?? 0}</p></div>
          <div className="bg-bg-primary border border-border p-2"><p className="text-[11px] uppercase text-text-secondary">{t('admin.completed', lang)}</p><p className="text-[18px] sm:text-[20px] font-bold text-text-primary mt-1">{stats?.completed_labs ?? 0}</p></div>
        </div>

      <h2 className="text-[14px] font-bold text-text-primary mb-2">{t('admin.recentActivity', lang)}</h2>
      <div className="bg-bg-primary border border-border p-2">
        <div className="-mx-4 sm:mx-0 overflow-x-auto">
          <div className="min-w-[600px] sm:min-w-0">
        <Table headers={[t('admin.tableStudent', lang), t('admin.tableTitle', lang), t('admin.tableSubject', lang), t('admin.tableStatus', lang), t('admin.tableScore', lang), t('admin.tableDate', lang)]}>
          {activity.map((a, i) => (
            <Tr key={i}>
              <Td className="text-[12px]">{a.full_name}</Td>
              <Td className="text-[12px]">{a.title}</Td>
              <Td className="text-[12px]">{a.subject}</Td>
              <Td><Badge variant={a.status === 'completed' ? 'success' : 'warning'}>{a.status}</Badge></Td>
              <Td className="text-[12px]">{a.score}/100</Td>
              <Td className="text-[12px]">{a.last_server_ts ? new Date(a.last_server_ts).toLocaleDateString() : '—'}</Td>
            </Tr>
          ))}
        </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
