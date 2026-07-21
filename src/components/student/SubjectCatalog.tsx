import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

interface SubjectItem {
  id: string
  name: string
  name_sw: string
  icon: string | null
  lab_count: number
}

interface SubjectCatalogProps {
  subjects: SubjectItem[]
  lang?: 'en' | 'sw'
}

export function SubjectCatalog({ subjects, lang = 'en' }: SubjectCatalogProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {subjects.map(s => (
        <Card key={s.id} hover interactive>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-text-primary">{lang === 'sw' ? s.name_sw : s.name}</h3>
              <p className="text-[12px] text-text-secondary mt-1 uppercase">{s.name_sw}</p>
            </div>
            {s.icon && <span className="text-2xl">{s.icon}</span>}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Badge variant="info">{s.lab_count} labs</Badge>
            <Link href={`/student/${s.name.toLowerCase()}`} className="text-[12px] text-accent-blue underline">
              Open
            </Link>
          </div>
        </Card>
      ))}
    </div>
  )
}
