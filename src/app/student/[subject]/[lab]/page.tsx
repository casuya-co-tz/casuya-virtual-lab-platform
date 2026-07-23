'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

interface Lab {
  id: string
  title: string
  title_sw: string
  description: string
  subject: string
  html_threejs_code: string | null
  is_published: boolean
  version: number
}

interface Progress {
  status: string
  score: number
}

interface Props {
  params: { subject: string; lab: string }
}

export default function LabPlayer({ params }: Props) {
  const { subject, lab } = params
  const router = useRouter()
  const { lang } = useLanguage()
  const [labData, setLabData] = useState<Lab | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [previewKey, setPreviewKey] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch(`/api/labs/${lab}`).then(r => r.ok ? r.json() : null),
      fetch('/api/progress').then(r => r.ok ? r.json() : []),
    ])
      .then(([labResult, progressResult]) => {
        if (labResult) setLabData(labResult)
        const allProgress = Array.isArray(progressResult) ? progressResult : []
        const p = allProgress.find((d: Progress & { lab_id?: string }) => d.lab_id === lab)
        if (p) setProgress({ status: p.status, score: p.score })
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load lab data.')
        setLoading(false)
      })
  }, [lab])

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_id: lab, status: 'in_progress', score: 0 }),
      })
      if (!res.ok) setError('Failed to save progress. Please try again.')
    } catch {
      setError('Network error. Please check your connection.')
    }
    setSaving(false)
  }

  async function handleSubmit() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_id: lab, status: 'completed', score: 0 }),
      })
      if (res.ok) {
        setProgress({ status: 'completed', score: 0 })
      } else {
        setError('Failed to submit lab. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    }
    setSaving(false)
  }

  const hasCode = labData?.html_threejs_code && labData.html_threejs_code.trim().length > 0
  const displayName = lang === 'sw' ? (labData?.title_sw || labData?.title) : (labData?.title || lab.replace(/-/g, ' '))

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-bg-tertiary animate-pulse mb-2" />
            <div className="h-4 w-24 bg-bg-tertiary animate-pulse" />
          </div>
          <div className="h-6 w-20 bg-bg-tertiary animate-pulse" />
        </div>
        <div className="flex gap-4 mb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-bg-tertiary animate-pulse" />
          ))}
        </div>
        <div className="h-[60vh] max-h-[500px] bg-bg-tertiary animate-pulse" />
      </div>
    )
  }

  if (error && !labData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-[20px] font-bold text-text-primary mb-2">{t('common.error', lang)}</h2>
        <p className="text-[14px] text-text-secondary mb-6">{error}</p>
        <Button variant="primary" onClick={() => router.back()}>{t('student.back', lang)}</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-[12px] text-accent-blue underline mb-2 block"
          >
            &larr; {t('student.back', lang)}
          </button>
          <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary">
            {displayName}
          </h1>
          <p className="text-[12px] text-text-secondary mt-1 uppercase">{subject}</p>
        </div>
        <Badge variant={progress?.status === 'completed' ? 'success' : progress?.status === 'in_progress' ? 'warning' : 'neutral'}>
          {progress?.status === 'completed'
            ? `${t('student.score', lang)}: ${progress.score}/100`
            : progress?.status === 'in_progress'
              ? t('student.continue', lang)
              : t('student.startLab', lang)}
        </Badge>
      </div>

      {error && (
        <div className="p-3 bg-accent-red/10 border border-accent-red/30 text-accent-red text-[13px]">
          {error}
        </div>
      )}

      <Tabs
        tabs={[
          {
            id: 'simulation',
            label: t('student.simulation', lang),
            content: hasCode ? (
              <div className="border border-border-DEFAULT">
                <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary border-b border-border-DEFAULT">
                  <span className="text-[12px] text-text-secondary uppercase">{t('student.labEnvironment', lang)}</span>
                  <Button variant="ghost" onClick={() => setPreviewKey(k => k + 1)}>{t('student.refresh', lang)}</Button>
                </div>
                <iframe
                  key={previewKey}
                  srcDoc={labData!.html_threejs_code!}
                  sandbox="allow-scripts"
                  className="w-full h-[60vh] max-h-[500px] bg-white"
                  title="Lab Simulation"
                />
              </div>
            ) : (
              <div className="bg-bg-secondary border border-border-DEFAULT h-[60vh] max-h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[14px] text-text-secondary mb-2">{t('student.noLabCode', lang)}</p>
                  <p className="text-[12px] text-text-disabled">{t('student.contactInstructor', lang)}</p>
                </div>
              </div>
            ),
          },
          {
            id: 'instructions',
            label: t('student.instructions', lang),
            content: (
              <Card>
                <h3 className="text-[16px] font-bold text-text-primary mb-2">{t('student.instructions', lang)}</h3>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  {labData?.description || 'Follow the steps below to complete this lab experiment.'}
                </p>
              </Card>
            ),
          },
          {
            id: 'results',
            label: t('student.results', lang),
            content: (
              <Card>
                <h3 className="text-[16px] font-bold text-text-primary mb-2">{t('student.results', lang)}</h3>
                {progress?.status === 'completed' ? (
                  <p className="text-[14px] text-accent-green">{t('student.score', lang)}: {progress.score}/100</p>
                ) : (
                  <p className="text-[14px] text-text-secondary">Complete the simulation to see your results here.</p>
                )}
              </Card>
            ),
          },
        ]}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="primary" onClick={handleSubmit} disabled={saving}>
          {saving ? t('common.save', lang) + '...' : t('student.submit', lang)}
        </Button>
        <Button variant="secondary" onClick={handleSave} disabled={saving}>{t('student.save', lang)}</Button>
      </div>
    </div>
  )
}
