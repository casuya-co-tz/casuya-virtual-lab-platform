'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface Paper {
  id: string
  subject: string
  year: number
  paper_number: number
  exam_body: string
  title: string
  title_sw: string
  is_premium: boolean
  created_at: string
}

export default function TeacherPastPapersPage() {
  const { lang } = useLanguage()
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetch('/api/past-papers')
      .then(r => r.json())
      .then(d => { setPapers(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? papers : papers.filter(p => p.subject === filter)
  const subjects = ['all', 'physics', 'chemistry', 'biology']

  return (
    <div className="min-h-screen bg-bg-secondary px-1 py-2">
      <h1 className="text-[clamp(18px,4vw,28px)] font-bold text-text-primary mb-1">{t('pastPapers.title', lang)}</h1>
      <p className="text-[12px] sm:text-[14px] text-text-secondary mb-3">{t('pastPapers.subtitle', lang)}</p>

      <div className="flex gap-1.5 mb-3 flex-wrap">
        {subjects.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-[12px] sm:text-[13px] font-bold transition-all ${
              filter === s ? 'bg-accent-blue text-white' : 'bg-bg-primary border border-border text-text-secondary hover:border-border-strong'
            }`}
          >
            {s === 'all' ? t('common.all', lang) : t(`subject.${s}`, lang)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-text-secondary">{t('common.loading', lang)}</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-text-secondary">{t('pastPapers.noPapers', lang)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filtered.map(paper => (
            <div key={paper.id} className="bg-bg-primary border border-border p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] sm:text-[14px] font-bold text-text-primary break-words">
                    {lang === 'sw' ? paper.title_sw : paper.title}
                  </h3>
                  <p className="text-[11px] sm:text-[12px] text-text-secondary mt-0.5">
                    {t(`subject.${paper.subject}`, lang)} &middot; {paper.year} &middot; {t('pastPapers.paper', lang)} {paper.paper_number}
                  </p>
                </div>
                {paper.is_premium && <Badge variant="info" className="self-start shrink-0 text-[10px]">{t('pastPapers.premium', lang)}</Badge>}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-[11px] sm:text-[12px] text-text-secondary">{paper.exam_body}</span>
                <a href={`/teacher/past-papers/${paper.id}/practice`} className="w-full sm:w-auto">
                  <Button variant="secondary" className="!h-7 !text-[11px] w-full sm:w-auto">{t('pastPapers.startPractice', lang)}</Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
