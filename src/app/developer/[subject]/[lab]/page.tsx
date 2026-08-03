'use client'
import { useEffect, useState, use } from 'react';
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SimulationWrapper } from '@/components/student/SimulationWrapper'

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

interface Props {
  params: Promise<{ subject: string; lab: string }>
}

export default function DeveloperLabPage(props: Props) {
  const params = use(props.params);
  const { subject, lab } = params
  const router = useRouter()
  const { lang } = useLanguage()
  const [labData, setLabData] = useState<Lab | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [previewKey, setPreviewKey] = useState(0)

  useEffect(() => {
    fetch(`/api/labs/${lab}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(data => { setLabData(data); setLoading(false) })
      .catch(() => { setError('Lab not found.'); setLoading(false) })
  }, [lab])

  const displayName = lang === 'sw' ? (labData?.title_sw || labData?.title) : (labData?.title || lab)
  const hasCode = labData?.html_code && labData.html_code.trim().length > 0

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-8 w-64 bg-bg-tertiary animate-pulse mb-2" />
        <div className="h-[60vh] max-h-[500px] bg-bg-tertiary animate-pulse" />
      </div>
    )
  }

  if (error || !labData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-[20px] font-bold text-text-primary mb-2">Not Found</h2>
        <p className="text-[14px] text-text-secondary mb-6">{error || 'Lab not found.'}</p>
        <Button variant="primary" onClick={() => router.back()}>Back</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <button
          onClick={() => router.back()}
          className="text-[12px] text-accent-blue underline mb-2 block"
        >
          &larr; {subject}
        </button>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-[clamp(18px,4vw,24px)] font-bold text-text-primary">{displayName}</h1>
          {labData.is_premium && <Badge variant="warning">PRO</Badge>}
          <Badge variant={labData.is_premium ? 'success' : 'neutral'}>
            {labData.is_premium ? 'LIVE' : 'DRAFT'}
          </Badge>
            <span className="text-[12px] text-text-secondary">v{labData.current_version}</span>
        </div>
        <p className="text-[11px] text-text-secondary uppercase">{subject}</p>
      </div>

      {hasCode ? (
        <div className="border border-border">
          <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary border-b border-border">
            <span className="text-[12px] text-text-secondary uppercase">Lab Simulation</span>
            <Button variant="ghost" onClick={() => setPreviewKey(k => k + 1)}>Refresh</Button>
          </div>
          <SimulationWrapper htmlCode={labData.html_code!} previewKey={previewKey} />
        </div>
      ) : (
        <div className="bg-bg-secondary border border-border h-[60vh] max-h-[500px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-[14px] text-text-secondary mb-2">No simulation code available for this lab.</p>
            <p className="text-[12px] text-text-disabled">Lab ID: <code className="font-mono">{lab}</code></p>
          </div>
        </div>
      )}

      {labData.description && (
        <div className="bg-bg-primary border border-border p-2">
          <h3 className="text-[14px] font-bold text-text-primary mb-1">Description</h3>
          <p className="text-[12px] text-text-secondary leading-relaxed">{labData.description}</p>
        </div>
      )}

      <div className="bg-bg-primary border border-border p-2">
        <h3 className="text-[14px] font-bold text-text-primary mb-1">API Access</h3>
        <p className="text-[12px] text-text-secondary mb-2">Access this lab via the developer API:</p>
        <code className="block bg-bg-secondary border border-border p-2 text-[11px] font-mono text-accent-blue">
          GET /api/v1/labs/{lab}
        </code>
        <p className="text-[10px] text-text-secondary mt-1">Requires a valid API key in the Authorization header.</p>
      </div>
    </div>
  )
}
