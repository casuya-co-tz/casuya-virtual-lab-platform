'use client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { useAuth } from '@/hooks/useAuth'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const subjects = [
  { id: 'physics', icon: '\u269B', desc: 'Circuits, Optics, Mechanics, Waves', labs: 12 },
  { id: 'chemistry', icon: '\uD83E\uDDEA', desc: 'Titration, pH, Reactions, Bonds', labs: 8 },
  { id: 'biology', icon: '\uD83E\uDDEB', desc: 'Anatomy, Genetics, Ecology, Cells', labs: 6 },
]

export function SubjectCards() {
  const router = useRouter()
  const { lang } = useLanguage()
  const { user, loading } = useAuth()

  function handleClick(id: string) {
    if (loading) return
    if (user) {
      router.push(`/student/${id}`)
    } else {
      router.push(`/auth?redirect=/student/${id}`)
    }
  }

  return (
    <section className="px-6 py-12 max-w-6xl mx-auto">
      <h2 className="text-[clamp(20px,4vw,32px)] font-bold text-text-primary mb-8">
        {t('nav.subjects', lang)}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subjects.map(s => (
          <Card key={s.id} hover interactive onClick={() => handleClick(s.id)}>
            <div className="flex items-start gap-3">
              <span className="text-[32px]">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-[16px] font-bold text-text-primary">{t(`subject.${s.id}`, lang)}</h3>
                <p className="text-[14px] text-text-secondary mt-1 line-clamp-2">{s.desc}</p>
                <Badge variant="info" className="mt-3">{s.labs} Labs Active</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
