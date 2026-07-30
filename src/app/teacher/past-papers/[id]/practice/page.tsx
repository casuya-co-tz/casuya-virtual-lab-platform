'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useRouter, useParams } from 'next/navigation'
import InteractiveExam from '@/components/exam/InteractiveExam'

export default function TeacherPracticePage() {
  const { lang } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const [paper, setPaper] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/past-papers/${params.id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(data => { setPaper(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="p-2 text-center text-text-secondary">{t('common.loading', lang)}</div>
  if (!paper) return <div className="p-2 text-center text-text-secondary">{t('error.notFound', lang)}</div>

  return (
    <div className="min-h-screen bg-bg-secondary px-1 py-2">
      <Button variant="ghost" onClick={() => router.push('/teacher/past-papers')} className="mb-2">
        &larr; {t('common.back', lang)}
      </Button>

      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h1 className="text-[clamp(16px,3vw,24px)] font-bold text-text-primary">
            {String(lang === 'sw' ? paper.title_sw : paper.title)}
          </h1>
          <p className="text-[12px] sm:text-[13px] text-text-secondary mt-0.5">
            {String(paper.subject)} &middot; {String(paper.year)} &middot; {t('pastPapers.paper', lang)} {String(paper.paper_number)}
          </p>
        </div>
        {Boolean(paper.is_premium) && <Badge variant="info">{t('pastPapers.premium', lang)}</Badge>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
        <div className="bg-bg-primary border border-border p-2">
          <span className="text-[10px] uppercase tracking-[1px] text-text-secondary font-bold">{t('pastPapers.year', lang)}</span>
          <p className="text-[13px] font-semibold text-text-primary mt-0.5">{String(paper.year)}</p>
        </div>
        <div className="bg-bg-primary border border-border p-2">
          <span className="text-[10px] uppercase tracking-[1px] text-text-secondary font-bold">{t('pastPapers.paper', lang)}</span>
          <p className="text-[13px] font-semibold text-text-primary mt-0.5">{String(paper.paper_number)}</p>
        </div>
        <div className="bg-bg-primary border border-border p-2">
          <span className="text-[10px] uppercase tracking-[1px] text-text-secondary font-bold">{t('admin.tableSubject', lang)}</span>
          <p className="text-[13px] font-semibold text-text-primary mt-0.5 capitalize">{String(paper.subject)}</p>
        </div>
        <div className="bg-bg-primary border border-border p-2">
          <span className="text-[10px] uppercase tracking-[1px] text-text-secondary font-bold">{t('admin.tableExamBody', lang)}</span>
          <p className="text-[13px] font-semibold text-text-primary mt-0.5">{String(paper.exam_body)}</p>
        </div>
      </div>

      <Button variant="primary" onClick={() => alert(`Starting practice for: ${String(paper.title)}`)} className="mb-3">
        {t('pastPapers.startPractice', lang)}
      </Button>

      <div className="mt-1">
        <h2 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[1px] text-text-secondary mb-1.5">{t('admin.htmlContent', lang)}</h2>
        <InteractiveExam questions={paper.questions} />
      </div>
    </div>
  )
}
