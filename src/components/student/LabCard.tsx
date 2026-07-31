import { memo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

interface LabCardProps {
  id: string
  title: string
  title_sw: string
  subject: string
  status: 'not_started' | 'in_progress' | 'completed'
  score?: number
  lang?: string
}

const statusConfig: Record<string, { variant: 'neutral' | 'warning' | 'success'; label: Record<string, string> }> = {
  not_started: { variant: 'neutral', label: { en: 'Not Started', sw: 'Haijaanza' } },
  in_progress: { variant: 'warning', label: { en: 'In Progress', sw: 'Inaendelea' } },
  completed: { variant: 'success', label: { en: 'Completed', sw: 'Imekamilika' } },
}

const subjectLabels: Record<string, Record<string, string>> = {
  physics: { en: 'Physics', sw: 'Fizikia' },
  chemistry: { en: 'Chemistry', sw: 'Kemia' },
  biology: { en: 'Biology', sw: 'Biolojia' },
}

const linkLabels: Record<string, Record<string, string>> = {
  not_started: { en: 'Start Lab', sw: 'Anza Maabara' },
  in_progress: { en: 'Continue', sw: 'Endelea' },
  completed: { en: 'Review', sw: 'Kagua' },
}

export const LabCard = memo(function LabCard({ id, title, title_sw, subject, status, score, lang = 'en' }: LabCardProps) {
  const config = statusConfig[status] || statusConfig.not_started
  const subjectLabel = subjectLabels[subject]?.[lang] || subject
  const linkLabel = linkLabels[status]?.[lang] || 'View'

  return (
    <Card hover interactive>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[16px] font-bold text-text-primary">{lang === 'sw' ? title_sw : title}</h3>
          <p className="text-[12px] text-text-secondary mt-1">{lang === 'sw' ? title : title_sw}</p>
        </div>
        <Badge variant={config.variant}>{config.label[lang] || config.label.en}</Badge>
      </div>
      <p className="text-[12px] text-text-disabled mt-2 uppercase">{subjectLabel}</p>
      {score !== undefined && score > 0 && (
        <p className="text-[14px] text-text-primary mt-2">{score}/100</p>
      )}
      <Link
        href={`/student/${subject}/${id}`}
        className="mt-4 inline-block text-[12px] text-accent-blue underline"
      >
        {linkLabel}
      </Link>
    </Card>
  )
})
