'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => { if (r.ok) return r.json(); throw new Error() })
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false))
  }, [])

  function handleClick(id: string) {
    if (isLoggedIn === null) return
    if (isLoggedIn) {
      router.push(`/student/${id}`)
    } else {
      router.push(`/auth?redirect=/student/${id}`)
    }
  }

  return (
    <section className="px-6 py-24 bg-bg-primary border-b border-border-default">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[clamp(28px,5vw,40px)] font-extrabold text-text-primary mb-12 tracking-tight">
          {t('nav.subjects', lang)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subjects.map(s => (
            <div key={s.id} className="flex flex-col p-8 bg-bg-secondary border border-border-strong hover:-translate-y-1 transition-transform h-full">
              <div className="flex items-center justify-center w-16 h-16 bg-bg-tertiary border border-border-default text-[32px] mb-6">
                {s.icon}
              </div>
              <h3 className="text-[20px] font-bold text-text-primary mb-3">{t(`subject.${s.id}`, lang)}</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed mb-6 flex-1">{s.desc}</p>
              
              <div className="flex items-center justify-between border-t border-border-default pt-6 mt-auto">
                <Badge variant="info" className="!rounded-none">{s.labs} Labs Active</Badge>
                <button 
                  onClick={() => handleClick(s.id)}
                  className="text-[14px] font-bold text-text-primary hover:text-accent-blue transition-colors uppercase tracking-widest"
                >
                  Start Lab →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
