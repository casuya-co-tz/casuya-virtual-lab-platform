import { Badge } from '@/components/ui/Badge'

interface CurriculumBannerProps {
  subject: string
  totalLabs: number
  completedLabs: number
}

export function CurriculumBanner({ subject, totalLabs, completedLabs }: CurriculumBannerProps) {
  const pct = totalLabs > 0 ? Math.round((completedLabs / totalLabs) * 100) : 0

  return (
    <div className="bg-bg-secondary border border-border-DEFAULT p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-[16px] font-bold text-text-primary capitalize">{subject}</h2>
        <Badge variant={pct === 100 ? 'success' : 'info'}>{pct}% Complete</Badge>
      </div>
      <span className="text-[12px] text-text-secondary">{completedLabs}/{totalLabs} labs</span>
    </div>
  )
}
