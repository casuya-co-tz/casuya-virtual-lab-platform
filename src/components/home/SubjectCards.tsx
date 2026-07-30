'use client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { useUser } from '@/contexts/UserContext'

const subjects = [
  { id: 'physics', icon: '⚡', desc: 'Circuits, Optics, Mechanics, Waves', labs: 12 },
  { id: 'chemistry', icon: '🧪', desc: 'Titration, pH, Reactions, Bonds', labs: 8 },
  { id: 'biology', icon: '🔬', desc: 'Anatomy, Genetics, Ecology, Cells', labs: 6 },
]

export function SubjectCards() {
  const router = useRouter()
  const { lang } = useLanguage()
  const { user, loading } = useUser()

  function handleClick(id: string) {
    if (loading) return
    if (user) {
      router.push(`/student/${id}`)
    } else {
      router.push(`/auth?redirect=/student/${id}`)
    }
  }

  return (
    <section className="px-4 sm:px-6 py-10 sm:py-20 lg:py-24 bg-bg-primary border-b border-border">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[clamp(22px,5vw,38px)] font-extrabold text-text-primary mb-6 sm:mb-10 tracking-tight">
          {t('nav.subjects', lang)}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {subjects.map(s => (
            <div key={s.id} className="flex flex-col p-5 sm:p-7 bg-bg-secondary border border-border-strong hover:-translate-y-1 transition-transform h-full">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-bg-tertiary border border-border text-[24px] sm:text-[28px] mb-4">
                {s.icon}
              </div>
              <h3 className="text-[17px] sm:text-[19px] font-bold text-text-primary mb-2">{t(`subject.${s.id}`, lang)}</h3>
              <p className="text-[13px] sm:text-[14px] text-text-secondary leading-relaxed mb-5 flex-1">{s.desc}</p>

              <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent-blue bg-accent-blue/10 px-2 py-1">{s.labs} Labs</span>
                <button
                  onClick={() => handleClick(s.id)}
                  className="text-[13px] font-bold text-text-primary hover:text-accent-blue transition-colors uppercase tracking-wider"
                >
                  {lang === 'sw' ? 'Anza →' : 'Start →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
