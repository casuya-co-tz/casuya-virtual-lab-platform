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
}

const statusConfig = {
  not_started: { variant: 'neutral' as const, label: 'Not Started' },
  in_progress: { variant: 'warning' as const, label: 'In Progress' },
  completed: { variant: 'success' as const, label: 'Completed' },
}

export function LabCard({ id, title, title_sw, subject, status, score }: LabCardProps) {
  const config = statusConfig[status]

  return (
    <Card hover interactive>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[16px] font-bold text-text-primary">{title}</h3>
          <p className="text-[12px] text-text-secondary mt-1">{title_sw}</p>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
      {score !== undefined && score > 0 && (
        <p className="text-[14px] text-text-primary mt-4">Score: {score}/100</p>
      )}
      <Link
        href={`/student/${subject}/${id}`}
        className="mt-4 inline-block text-[12px] text-accent-blue underline"
      >
        {status === 'not_started' ? 'Start Lab' : status === 'in_progress' ? 'Continue' : 'Review'}
      </Link>
    </Card>
  )
}
