'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { LabCard } from '@/components/student/LabCard'

interface LabProgress {
  lab_id: string
  title: string
  title_sw: string
  subject: string
  status: 'not_started' | 'in_progress' | 'completed'
  score: number
}

export default function StudentDashboard() {
  const { lang } = useLanguage()
  const [labs, setLabs] = useState<LabProgress[]>([])
  const [allLabs, setAllLabs] = useState<LabProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/progress').then(r => r.ok ? r.json() : []),
      fetch('/api/labs').then(r => r.ok ? r.json() : { data: [] }),
    ])
      .then(([progressData, labsData]) => {
        const progressList = Array.isArray(progressData) ? progressData : []
        setLabs(progressList)

        const allLabsList = Array.isArray(labsData.data) ? labsData.data : []
        const published = allLabsList
          .map((l: { id: string; title: string; title_sw?: string; subject: string }) => ({
            lab_id: l.id,
            title: l.title,
            title_sw: l.title_sw || l.title,
            subject: l.subject,
            status: 'not_started' as const,
            score: 0,
          }))
        setAllLabs(published)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const displayLabs = labs.length > 0 ? labs : allLabs
  const completedCount = labs.filter(l => l.status === 'completed').length
  const totalLabs = labs.length || 1
  const pct = Math.round((completedCount / totalLabs) * 100)

  return (
    <div className="px-1 py-2">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[12px] sm:text-[13px] font-bold text-accent-green">&check; {t('student.online', lang)}</span>
        {labs.length > 0 && (
          <>
            <span className="text-[12px] text-text-secondary">|</span>
            <span className="text-[12px] text-text-secondary">{pct}% {t('student.progress', lang)}</span>
          </>
        )}
      </div>
      <h1 className="text-[clamp(18px,4vw,28px)] font-bold text-text-primary mb-3">
        {t('nav.dashboard', lang)}
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-bg-tertiary animate-pulse" />
          ))}
        </div>
      ) : displayLabs.length === 0 ? (
        <div className="text-center py-6 border border-border bg-bg-primary">
          <p className="text-[13px] text-text-secondary mb-3">
            {t('student.noLabsYet', lang)}
          </p>
          <a href="/student/physics">
            <Button variant="primary">{t('student.browseSubjects', lang)}</Button>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {displayLabs.map(lab => (
            <LabCard
              key={lab.lab_id}
              id={lab.lab_id}
              title={lab.title}
              title_sw={lab.title_sw}
              subject={lab.subject}
              status={lab.status}
              score={lab.score}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  )
}
