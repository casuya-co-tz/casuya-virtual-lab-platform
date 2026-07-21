'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Table, Tr, Td } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { StatsGrid } from '@/components/admin/StatsGrid'

interface Stats {
  total_students: number
  total_labs: number
  published_labs: number
  total_progress: number
  completed_labs: number
  avg_score: number
}

interface Lab {
  id: string
  title: string
  subject: string
  subject_name: string
  is_published: boolean
  version: number
  created_at: string
}

export default function AdminDashboard() {
  const { lang } = useLanguage()
  const [stats, setStats] = useState<Stats | null>(null)
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.ok ? r.json() : null),
      fetch('/api/labs').then(r => r.ok ? r.json() : []),
    ])
      .then(([statsData, labsData]) => {
        setStats(statsData)
        setLabs(Array.isArray(labsData) ? labsData.slice(0, 10) : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  return (
    <div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('admin.dashboard', lang)}</h1>

      {stats && (
        <StatsGrid stats={[
          { label: t('admin.activeStudents', lang), value: stats.total_students.toLocaleString() },
          { label: t('admin.totalLabs', lang), value: stats.total_labs },
          { label: t('admin.avgScore', lang), value: `${Math.round(stats.avg_score)}/100` },
        ]} />
      )}

      <h2 className="text-[16px] font-bold text-text-primary mt-8 mb-4">{t('admin.recentLabs', lang)}</h2>
      {labs.length === 0 ? (
        <Card><p className="text-[14px] text-text-secondary text-center py-4">{t('admin.noLabs', lang)}</p></Card>
      ) : (
        <Table headers={[t('admin.tableTitle', lang), t('admin.tableSubject', lang), t('admin.tableStatus', lang), t('admin.tableVersion', lang), t('admin.tableActions', lang)]}>
          {labs.map(lab => (
            <Tr key={lab.id}>
              <Td>{lab.title}</Td>
              <Td>{lab.subject_name || lab.subject}</Td>
              <Td><Badge variant={lab.is_published ? 'success' : 'neutral'}>{lab.is_published ? t('admin.published', lang) : t('admin.draft', lang)}</Badge></Td>
              <Td>v{lab.version}</Td>
              <Td><a href={`/admin/labs/${lab.id}`} className="text-[12px] text-accent-blue underline">{t('admin.edit', lang)}</a></Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  )
}
