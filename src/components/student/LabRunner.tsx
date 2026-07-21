'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LabSimulation } from '@/components/simulation/LabSimulation'

interface LabRunnerProps {
  labId: string
  title: string
  subject: string
  description?: string
  initialStatus?: string
  initialScore?: number
}

export function LabRunner({ labId, title, subject, description, initialStatus, initialScore }: LabRunnerProps) {
  const [status, setStatus] = useState(initialStatus || 'in_progress')
  const [score, setScore] = useState(initialScore || 0)
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    setSaving(true)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_id: labId, status: 'completed', score: Math.floor(Math.random() * 100) }),
      })
      const data = await res.json()
      setStatus('completed')
      setScore(data.score || 0)
    } catch {}
    setSaving(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_id: labId, status: 'in_progress', score }),
      })
    } catch {}
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary">{title}</h1>
          {description && <p className="text-[14px] text-text-secondary mt-1">{description}</p>}
        </div>
        <Badge variant={status === 'completed' ? 'success' : 'warning'}>
          {status === 'completed' ? `Done - ${score}/100` : 'In Progress'}
        </Badge>
      </div>

      <div className="bg-bg-secondary border border-border-DEFAULT h-[500px]">
        <LabSimulation subject={subject} />
      </div>

      <div className="flex gap-3">
        <Button variant="primary" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : 'Submit Lab'}
        </Button>
        <Button variant="secondary" onClick={handleSave} disabled={saving}>Save Progress</Button>
      </div>
    </div>
  )
}
