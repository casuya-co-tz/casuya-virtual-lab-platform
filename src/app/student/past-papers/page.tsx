'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
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

export default function PastPapersPage() {
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
    <div className="min-h-screen bg-bg-secondary px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2">{t('pastPapers.title', lang)}</h1>
        <p className="text-[14px] text-text-secondary mb-6">{t('pastPapers.subtitle', lang)}</p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
                filter === s ? 'bg-accent-blue text-white' : 'bg-bg-primary border border-border-default text-text-secondary hover:border-border-strong'
              }`}
            >
              {s === 'all' ? t('common.all', lang) : t(`subject.${s}`, lang)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-text-secondary">{t('common.loading', lang)}</p>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-text-secondary">{t('pastPapers.noPapers', lang)}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(paper => (
              <Card key={paper.id} hover interactive>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[15px] font-bold text-text-primary">
                      {lang === 'sw' ? paper.title_sw : paper.title}
                    </h3>
                    <p className="text-[12px] text-text-secondary mt-1">
                      {t(`subject.${paper.subject}`, lang)} &middot; {paper.year} &middot; {t('pastPapers.paper', lang)} {paper.paper_number}
                    </p>
                  </div>
                  {paper.is_premium && <Badge variant="info">{t('pastPapers.premium', lang)}</Badge>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-text-secondary">{paper.exam_body}</span>
                  <a href={`/student/past-papers/${paper.id}`}>
                    <Button variant="secondary" className="!h-8 !text-[12px]">{t('pastPapers.startPractice', lang)}</Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
