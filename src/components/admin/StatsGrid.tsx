import { Card } from '@/components/ui/Card'

interface Stat {
  label: string
  value: string | number
  change?: string
}

interface StatsGridProps {
  stats: Stat[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map(s => (
        <Card key={s.label}>
          <p className="text-[12px] uppercase text-text-secondary">{s.label}</p>
          <p className="text-[clamp(20px,4vw,32px)] font-bold text-text-primary mt-1">{s.value}</p>
          {s.change && <p className="text-[12px] text-accent-green mt-1">{s.change}</p>}
        </Card>
      ))}
    </div>
  )
}
