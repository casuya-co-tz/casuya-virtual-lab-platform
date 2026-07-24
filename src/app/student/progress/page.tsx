'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'

interface ProgressData {
  labs_completed: number
  average_score: number
  total_labs: number
  recent_activity: Array<{ lab_title: string; score: number; status: string; completed_at: string }>
}

export default function ProgressPage() {
  const { lang } = useLanguage()
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/lab-progress').then(r => r.ok ? r.json() : []),
      fetch('/api/subjects').then(r => r.ok ? r.json() : []),
    ]).then(([progress, subjects]) => {
      const progressArr = Array.isArray(progress) ? progress : []
      const completed = progressArr.filter((p: { status: string }) => p.status === 'completed')
      const totalScore = completed.reduce((sum: number, p: { score: number }) => sum + (p.score || 0), 0)
      setData({
        labs_completed: completed.length,
        average_score: completed.length > 0 ? Math.round(totalScore / completed.length) : 0,
        total_labs: progressArr.length,
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

  if (loading) return <div className="p-8 text-text-secondary">{t('common.loading', lang)}</div>

  return (
    <div className="min-h-screen bg-bg-secondary px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('progress.title', lang)}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <p className="text-[12px] uppercase text-text-secondary">{t('progress.labsCompleted', lang)}</p>
            <p className="text-[28px] font-bold text-text-primary mt-1">{data?.labs_completed || 0}</p>
          </Card>
          <Card>
            <p className="text-[12px] uppercase text-text-secondary">{t('progress.averageScore', lang)}</p>
            <p className="text-[28px] font-bold text-text-primary mt-1">{data?.average_score || 0}%</p>
          </Card>
          <Card>
            <p className="text-[12px] uppercase text-text-secondary">{t('progress.totalTime', lang)}</p>
            <p className="text-[28px] font-bold text-text-primary mt-1">{data?.total_labs || 0}</p>
          </Card>
        </div>

        <h2 className="text-[16px] font-bold text-text-primary mb-4">{t('progress.recentActivity', lang)}</h2>
        {!data?.recent_activity?.length ? (
          <Card className="text-center py-8">
            <p className="text-text-secondary">{t('progress.noActivity', lang)}</p>
          </Card>
        ) : (
          <Card>
            <div className="space-y-3">
              {data.recent_activity.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border-DEFAULT last:border-0">
                  <div>
                    <p className="text-[14px] font-medium text-text-primary">{a.lab_title}</p>
                    <p className="text-[12px] text-text-secondary">{new Date(a.completed_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-bold text-text-primary">{a.score}%</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                      a.status === 'completed' ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-amber/20 text-accent-amber'
                    }`}>
                      {a.status === 'completed' ? t('student.status.completed', lang) : t('student.status.inProgress', lang)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
