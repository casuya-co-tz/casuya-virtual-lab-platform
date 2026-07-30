'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { SimulationWrapper, LabProgressEvent } from '@/components/student/SimulationWrapper'
import { LabTimer } from '@/components/student/LabTimer'
import { UpgradePrompt } from '@/components/pricing/UpgradePrompt'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

interface Lab {
  id: string
  title: string
  title_sw: string
  description: string
  subject: string
  html_code: string | null
  is_premium: boolean
  current_version: number
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
  const [hasActiveSub, setHasActiveSub] = useState<boolean | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [liveScore, setLiveScore] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/labs/${lab}`).then(r => {
        if (!r.ok) throw new Error('Lab not found')
        return r.json()
      }),
      fetch('/api/progress').then(r => r.ok ? r.json() : []),
      fetch('/api/subscription').then(r => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([labResult, progressResult, subResult]) => {
        setLabData(labResult)
        const allProgress = Array.isArray(progressResult) ? progressResult : []
        const p = allProgress.find((d: Progress & { lab_id?: string }) => d.lab_id === lab)
        if (p) setProgress({ status: p.status, score: p.score })
        setHasActiveSub(!!subResult?.subscription)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load lab data.')
        setLoading(false)
      })
  }, [lab])

  async function handleSave(score?: number) {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_id: lab, status: 'in_progress', score: score ?? liveScore ?? 0 }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'Failed to save progress.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    }
    setSaving(false)
  }

  async function handleSubmit(score?: number) {
    setSaving(true)
    setError('')
    const finalScore = score ?? liveScore ?? 0
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_id: lab, status: 'completed', score: finalScore }),
      })
      if (res.ok) {
        setProgress({ status: 'completed', score: finalScore })
      } else {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'Failed to submit lab.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    }
    setSaving(false)
  }

  const hasCode = labData?.html_code && labData.html_code.trim().length > 0
  const displayName = lang === 'sw' ? (labData?.title_sw || labData?.title) : (labData?.title || lab.replace(/-/g, ' '))
  const isPaywalled = labData?.is_premium && !hasActiveSub

  const handleLabProgress = (event: LabProgressEvent) => {
    setLiveScore(event.score)
    if (event.status === 'completed') {
      handleSubmit(event.score)
    } else if (event.status === 'in_progress') {
      handleSave(event.score)
    }
  }

  if (isPaywalled && showUpgrade) {
    return (
      <UpgradePrompt
        recommendedPlan="basic"
        lang={lang}
        onClose={() => setShowUpgrade(false)}
      />
    )
  }

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
    <div className="flex flex-col gap-3 px-1 py-2">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="text-[11px] text-accent-blue underline mb-1 block">&larr; {t('student.back', lang)}</button>
          <h1 className="text-[clamp(16px,4vw,24px)] font-bold text-text-primary">{displayName}</h1>
          <p className="text-[11px] text-text-secondary mt-0.5 uppercase">{subject}</p>
        </div>
        <Badge variant={progress?.status === 'completed' ? 'success' : progress?.status === 'in_progress' ? 'warning' : 'neutral'} className="text-[10px]">
          {progress?.status === 'completed' ? `${t('student.score', lang)}: ${progress.score}/100` : progress?.status === 'in_progress' ? t('student.continue', lang) : liveScore !== null ? `${t('student.score', lang)}: ${liveScore}/100` : t('student.startLab', lang)}
        </Badge>
      </div>

      {error && (
        <div className="p-2 bg-accent-red/10 border border-accent-red/30 text-accent-red text-[12px]">{error}</div>
      )}

      <Tabs
        tabs={[
          {
            id: 'simulation',
            label: t('student.simulation', lang),
            content: isPaywalled ? (
              <div className="bg-bg-secondary border border-border h-[60vh] max-h-[500px] flex items-center justify-center">
                <div className="text-center px-2">
                  <p className="text-[13px] text-text-secondary mb-3">{lang === 'sw' ? 'Maabara hii inahitaji usajili wa premium' : 'This lab requires a premium subscription'}</p>
                  <Button variant="primary" onClick={() => setShowUpgrade(true)}>{lang === 'sw' ? 'Boresha Sasa' : 'Upgrade Now'}</Button>
                </div>
              </div>
            ) : hasCode ? (
              <div className="border border-border">
                <div className="flex items-center justify-between px-2 py-1 bg-bg-tertiary border-b border-border">
                  <span className="text-[11px] text-text-secondary uppercase">{t('student.labEnvironment', lang)}</span>
                  <Button variant="ghost" onClick={() => setPreviewKey(k => k + 1)} className="!h-6 !text-[10px]">{t('student.refresh', lang)}</Button>
                </div>
                <LabTimer autoStart={false} />
                <SimulationWrapper htmlCode={labData!.html_code!} previewKey={previewKey} onProgress={handleLabProgress} />
              </div>
            ) : (
              <div className="bg-bg-secondary border border-border h-[60vh] max-h-[500px] flex items-center justify-center">
                <div className="text-center px-2">
                  <p className="text-[13px] text-text-secondary mb-1">{t('student.noLabCode', lang)}</p>
                  <p className="text-[11px] text-text-disabled">{t('student.contactInstructor', lang)}</p>
                </div>
              </div>
            ),
          },
          {
            id: 'instructions',
            label: t('student.instructions', lang),
            content: (
              <div className="bg-bg-primary border border-border p-2">
                <h3 className="text-[14px] font-bold text-text-primary mb-1">{t('student.instructions', lang)}</h3>
                <p className="text-[12px] sm:text-[13px] text-text-secondary leading-relaxed">{labData?.description || 'Follow the steps below to complete this lab experiment.'}</p>
              </div>
            ),
          },
          {
            id: 'results',
            label: t('student.results', lang),
            content: (
              <div className="bg-bg-primary border border-border p-2">
                <h3 className="text-[14px] font-bold text-text-primary mb-1">{t('student.results', lang)}</h3>
                {progress?.status === 'completed' ? (
                  <p className="text-[12px] sm:text-[13px] text-accent-green">{t('student.score', lang)}: {progress.score}/100</p>
                ) : (
                  <p className="text-[12px] sm:text-[13px] text-text-secondary">Complete the simulation to see your results here.</p>
                )}
              </div>
            ),
          },
        ]}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="primary" onClick={() => handleSubmit()} disabled={saving}>{saving ? t('common.save', lang) + '...' : t('student.submit', lang)}</Button>
        <Button variant="secondary" onClick={() => handleSave()} disabled={saving}>{t('student.save', lang)}</Button>
      </div>
    </div>
  )
}
