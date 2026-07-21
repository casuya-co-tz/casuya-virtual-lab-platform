'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
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
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('admin.analytics', lang)}</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><p className="text-[12px] uppercase text-text-secondary">{t('stats.students', lang)}</p><p className="text-[24px] font-bold text-text-primary mt-1">{stats?.total_students ?? 0}</p></Card>
        <Card><p className="text-[12px] uppercase text-text-secondary">{t('admin.publishedLabs', lang)}</p><p className="text-[24px] font-bold text-text-primary mt-1">{stats?.published_labs ?? 0}/{stats?.total_labs ?? 0}</p></Card>
        <Card><p className="text-[12px] uppercase text-text-secondary">{t('admin.completionRate', lang)}</p><p className="text-[24px] font-bold text-text-primary mt-1">{stats?.total_progress ? Math.round((stats.completed_labs / stats.total_progress) * 100) : 0}%</p></Card>
        <Card><p className="text-[12px] uppercase text-text-secondary">{t('admin.avgScore', lang)}</p><p className="text-[24px] font-bold text-text-primary mt-1">{stats?.avg_score?.toFixed(1) ?? '0.0'}</p></Card>
        <Card><p className="text-[12px] uppercase text-text-secondary">{t('admin.totalAttempts', lang)}</p><p className="text-[24px] font-bold text-text-primary mt-1">{stats?.total_progress ?? 0}</p></Card>
        <Card><p className="text-[12px] uppercase text-text-secondary">{t('admin.completed', lang)}</p><p className="text-[24px] font-bold text-text-primary mt-1">{stats?.completed_labs ?? 0}</p></Card>
      </div>

      <h2 className="text-[16px] font-bold text-text-primary mb-4">{t('admin.recentActivity', lang)}</h2>
      <Card>
        <Table headers={[t('admin.tableStudent', lang), t('admin.tableTitle', lang), t('admin.tableSubject', lang), t('admin.tableStatus', lang), t('admin.tableScore', lang), t('admin.tableDate', lang)]}>
          {activity.map((a, i) => (
            <Tr key={i}>
              <Td>{a.full_name}</Td>
              <Td>{a.title}</Td>
              <Td>{a.subject}</Td>
              <Td><Badge variant={a.status === 'completed' ? 'success' : 'warning'}>{a.status}</Badge></Td>
              <Td>{a.score}/100</Td>
              <Td>{a.last_server_ts ? new Date(a.last_server_ts).toLocaleDateString() : '—'}</Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}
