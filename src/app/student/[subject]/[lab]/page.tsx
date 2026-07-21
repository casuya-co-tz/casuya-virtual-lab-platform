'use client'
import { use, useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'

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
  params: Promise<{ subject: string; lab: string }>
}

export default function LabPlayer({ params }: Props) {
  const { subject, lab } = use(params)
  const [labData, setLabData] = useState<Lab | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  useEffect(() => {
    fetch(`/api/labs/${lab}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setLabData(data) })
      .catch(() => {})

    fetch('/api/progress')
      .then(r => r.ok ? r.json() : [])
      .then((data: (Progress & { lab_id?: string })[]) => {
        const p = data.find(d => d.lab_id === lab)
        if (p) setProgress({ status: p.status, score: p.score })
      })
      .catch(() => {})
  }, [lab])

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_id: lab, status: 'in_progress', score: 0 }),
      })
    } catch {}
    setSaving(false)
  }

  async function handleSubmit() {
    setSaving(true)
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_id: lab, status: 'completed', score: Math.floor(Math.random() * 100) }),
      })
      setProgress({ status: 'completed', score: Math.floor(Math.random() * 100) })
    } catch {}
    setSaving(false)
  }

  const hasCode = labData?.html_threejs_code && labData.html_threejs_code.trim().length > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary">
            {labData?.title || lab.replace(/-/g, ' ')}
          </h1>
          <p className="text-[12px] text-text-secondary mt-1 uppercase">{subject}</p>
        </div>
        <Badge variant={progress?.status === 'completed' ? 'success' : 'warning'}>
          {progress?.status === 'completed' ? `Done - ${progress.score}/100` : 'In Progress'}
        </Badge>
      </div>

      <Tabs
        tabs={[
          {
            id: 'simulation',
            label: 'Simulation',
            content: hasCode ? (
              <div className="border border-border-DEFAULT">
                <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary border-b border-border-DEFAULT">
                  <span className="text-[12px] text-text-secondary uppercase">Lab Environment</span>
                  <Button variant="ghost" onClick={() => setPreviewKey(k => k + 1)}>Refresh</Button>
                </div>
                <iframe
                  key={previewKey}
                  srcDoc={labData!.html_threejs_code!}
                  sandbox="allow-scripts"
                  className="w-full h-[500px] bg-white"
                  title="Lab Simulation"
                />
              </div>
            ) : (
              <div className="bg-bg-secondary border border-border-DEFAULT h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[14px] text-text-secondary mb-2">No lab code available for this experiment.</p>
                  <p className="text-[12px] text-text-disabled">Contact your instructor to deploy the lab simulation.</p>
                </div>
              </div>
            ),
          },
          {
            id: 'instructions',
            label: 'Instructions',
            content: (
              <Card>
                <h3 className="text-[16px] font-bold text-text-primary mb-2">Instructions</h3>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  {labData?.description || 'Follow the steps below to complete this lab experiment.'}
                </p>
              </Card>
            ),
          },
          {
            id: 'results',
            label: 'Results',
            content: (
              <Card>
                <h3 className="text-[16px] font-bold text-text-primary mb-2">Results</h3>
                {progress?.status === 'completed' ? (
                  <p className="text-[14px] text-accent-green">Score: {progress.score}/100</p>
                ) : (
                  <p className="text-[14px] text-text-secondary">Complete the simulation to see your results here.</p>
                )}
              </Card>
            ),
          },
        ]}
      />

      <div className="flex gap-3">
        <Button variant="primary" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : 'Submit Lab'}
        </Button>
        <Button variant="secondary" onClick={handleSave} disabled={saving}>Save Progress</Button>
      </div>
    </div>
  )
}
