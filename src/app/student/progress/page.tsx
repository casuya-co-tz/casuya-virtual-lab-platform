'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'


interface ProgressData {
  labs_completed: number
  average_score: number
  total_time: string
  recent_activity: Array<{ lab_title: string; score: number; status: string; completed_at: string }>
}

export default function ProgressPage() {
  const { lang } = useLanguage()
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/progress').then(r => r.ok ? r.json() : []),
      fetch('/api/subjects').then(r => r.ok ? r.json() : []),
    ]).then(([progress, subjects]) => {
      const progressArr = Array.isArray(progress) ? progress : []
      const completed = progressArr.filter((p: { status: string }) => p.status === 'completed')
      const totalScore = completed.reduce((sum: number, p: { score: number }) => sum + (p.score || 0), 0)

      const totalMs = progressArr.reduce((sum: number, p: { started_at?: string; completed_at?: string; last_server_ts?: string }) => {
        const end = new Date(p.completed_at || p.last_server_ts || Date.now()).getTime()
        const start = new Date(p.started_at || end).getTime()
        return sum + Math.max(0, end - start)
      }, 0)
      const totalHours = Math.floor(totalMs / 3600000)
      const totalMinutes = Math.round((totalMs % 3600000) / 60000)

      setData({
        labs_completed: completed.length,
        average_score: completed.length > 0 ? Math.round(totalScore / completed.length) : 0,
        total_time: totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`,
        recent_activity: progressArr.slice(0, 10).map((p: { title?: string; title_sw?: string; score: number; status: string; completed_at?: string; started_at?: string }) => ({
          lab_title: p.title || p.title_sw || 'Lab',
          score: p.score || 0,
          status: p.status,
          completed_at: p.completed_at || p.started_at || new Date().toISOString(),
        })),
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-2 text-text-secondary">{t('common.loading', lang)}</div>

  return (
    <div className="px-1 py-2">
      <h1 className="text-[clamp(18px,4vw,28px)] font-bold text-text-primary mb-3">{t('progress.title', lang)}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <div className="bg-bg-primary border border-border p-2">
          <p className="text-[10px] uppercase text-text-secondary">{t('progress.labsCompleted', lang)}</p>
          <p className="text-[20px] sm:text-[24px] font-bold text-text-primary mt-0.5">{data?.labs_completed || 0}</p>
        </div>
        <div className="bg-bg-primary border border-border p-2">
          <p className="text-[10px] uppercase text-text-secondary">{t('progress.averageScore', lang)}</p>
          <p className="text-[20px] sm:text-[24px] font-bold text-text-primary mt-0.5">{data?.average_score || 0}%</p>
        </div>
        <div className="bg-bg-primary border border-border p-2">
          <p className="text-[10px] uppercase text-text-secondary">{t('progress.totalTime', lang)}</p>
          <p className="text-[20px] sm:text-[24px] font-bold text-text-primary mt-0.5">{data?.total_time || '0m'}</p>
        </div>
      </div>

      <h2 className="text-[14px] font-bold text-text-primary mb-2">{t('progress.recentActivity', lang)}</h2>
      {!data?.recent_activity?.length ? (
        <div className="text-center py-4 text-text-secondary">{t('progress.noActivity', lang)}</div>
      ) : (
        <div className="bg-bg-primary border border-border">
          <div className="space-y-0">
            {data.recent_activity.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-2 border-b border-border last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] sm:text-[13px] font-medium text-text-primary truncate">{a.lab_title}</p>
                  <p className="text-[10px] sm:text-[11px] text-text-secondary">{new Date(a.completed_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[12px] sm:text-[13px] font-bold text-text-primary">{a.score}%</span>
                  <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 ${
                    a.status === 'completed' ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-amber/20 text-accent-amber'
                  }`}>
                    {a.status === 'completed' ? t('student.status.completed', lang) : t('student.status.inProgress', lang)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
