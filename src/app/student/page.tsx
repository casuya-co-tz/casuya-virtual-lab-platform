'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LabCard } from '@/components/student/LabCard'

interface LabProgress {
  lab_id: string
  title: string
  subject: string
  status: 'not_started' | 'in_progress' | 'completed'
  score: number
}

export default function StudentDashboard() {
  const { lang } = useLanguage()
  const [labs, setLabs] = useState<LabProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/progress')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setLabs(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const completedCount = labs.filter(l => l.status === 'completed').length
  const totalLabs = labs.length || 1
  const pct = Math.round((completedCount / totalLabs) * 100)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[14px] font-bold text-accent-green">&check; Online</span>
        <span className="text-[14px] text-text-secondary">|</span>
        <span className="text-[14px] text-text-secondary">{pct}% Complete</span>
      </div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">
        {t('nav.dashboard', lang)}
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-bg-tertiary animate-pulse" />
          ))}
        </div>
      ) : labs.length === 0 ? (
        <Card>
          <p className="text-[14px] text-text-secondary text-center py-8">
            No labs assigned yet. Start by browsing subjects.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map(lab => (
            <LabCard
              key={lab.lab_id}
              id={lab.lab_id}
              title={lab.title}
              title_sw={lab.title}
              subject={lab.subject}
              status={lab.status}
              score={lab.score}
            />
          ))}
        </div>
      )}
    </div>
  )
}
