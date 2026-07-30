'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useRouter, useParams } from 'next/navigation'
import InteractiveExam from '@/components/exam/InteractiveExam'

interface PastPaperDetail {
  id: string
  subject: string
  year: number
  paper_number: number
  exam_body: string
  title: string
  title_sw: string
  is_premium: boolean
  sort_order: number
  questions: unknown
  created_at: string
}

const subjectColors: Record<string, string> = {
  physics: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
  chemistry: 'bg-accent-green/10 text-accent-green border-accent-green/20',
  biology: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
}

const subjectIcons: Record<string, string> = {
  physics: '\u269B',
  chemistry: '\u2697',
  biology: '\uD83E\uDDEA',
}

export default function AdminPastPaperDetailPage() {
  const { lang } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const [paper, setPaper] = useState<PastPaperDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/past-papers/${params.id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(data => { setPaper(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary px-1 py-2">
        <div className="h-3 sm:h-4 bg-bg-tertiary rounded w-36 sm:w-48 mb-3 animate-pulse" />
        <div className="h-5 bg-bg-tertiary rounded w-2/3 mb-2 animate-pulse" />
        <div className="h-3 bg-bg-tertiary rounded w-1/3 mb-3 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-bg-primary border border-border p-2 animate-pulse">
              <div className="h-2 bg-bg-tertiary rounded w-12 mb-1" />
              <div className="h-3 bg-bg-tertiary rounded w-16" />
            </div>
          ))}
        </div>
        <div className="bg-bg-primary border border-border p-3 animate-pulse">
          <div className="h-3 bg-bg-tertiary rounded w-32 mb-2" />
          <div className="h-24 bg-bg-tertiary rounded" />
        </div>
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center px-1">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-accent-red/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-text-primary mb-1">{t('error.notFound', lang)}</p>
          <p className="text-[13px] text-text-secondary mb-3">The past paper could not be found</p>
          <Button variant="primary" onClick={() => router.push('/admin/past-papers')}>
            {t('common.back', lang)}
          </Button>
        </div>
      </div>
    )
  }

  const subjectColorClass = subjectColors[paper.subject] || 'bg-bg-tertiary text-text-secondary border-border'

  return (
    <div className="min-h-screen bg-bg-secondary px-1 py-2">
      <nav className="flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] text-text-secondary mb-3 overflow-x-auto whitespace-nowrap pb-1">
        <button onClick={() => router.push('/admin/past-papers')} className="hover:text-text-primary transition-colors shrink-0">
          {t('admin.pastPapers', lang)}
        </button>
        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 text-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-text-primary truncate max-w-[160px] sm:max-w-none">
          {lang === 'sw' ? paper.title_sw : paper.title}
        </span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className={`hidden sm:flex w-8 h-8 shrink-0 items-center justify-center text-[16px] border ${subjectColorClass}`}>
            {subjectIcons[paper.subject] || '\uD83D\uDCC4'}
          </span>
          <div className="min-w-0">
            <h1 className="text-[clamp(16px,3vw,24px)] font-bold text-text-primary leading-tight">
              {lang === 'sw' ? paper.title_sw : paper.title}
            </h1>
            <p className="text-[12px] sm:text-[13px] text-text-secondary mt-0.5">
              <span className="capitalize">{paper.subject}</span>
              {' \u00B7 '}{paper.year}
              {' \u00B7 '}{t('pastPapers.paper', lang)} {paper.paper_number}
            </p>
          </div>
        </div>
        <Badge variant={paper.is_premium ? 'warning' : 'success'} className="shrink-0 self-start">
          {paper.is_premium ? t('pastPapers.premium', lang) : t('common.free', lang)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
        <div className="bg-bg-primary border border-border p-2">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[1px] text-text-secondary font-bold">{t('admin.tableSubject', lang)}</span>
          <p className="text-[12px] sm:text-[13px] font-semibold text-text-primary mt-0.5 capitalize">{paper.subject}</p>
        </div>
        <div className="bg-bg-primary border border-border p-2">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[1px] text-text-secondary font-bold">{t('admin.tableYear', lang)}</span>
          <p className="text-[12px] sm:text-[13px] font-semibold text-text-primary mt-0.5">{paper.year}</p>
        </div>
        <div className="bg-bg-primary border border-border p-2">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[1px] text-text-secondary font-bold">{t('admin.tablePaper', lang)}</span>
          <p className="text-[12px] sm:text-[13px] font-semibold text-text-primary mt-0.5">{paper.paper_number}</p>
        </div>
        <div className="bg-bg-primary border border-border p-2">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[1px] text-text-secondary font-bold">{t('admin.tableExamBody', lang)}</span>
          <p className="text-[12px] sm:text-[13px] font-semibold text-text-primary mt-0.5">{paper.exam_body}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <Button variant="ghost" onClick={() => router.push('/admin/past-papers')}>
          {t('common.back', lang)}
        </Button>
        <Button variant="primary" onClick={() => router.push(`/admin/past-papers/${params.id}/edit`)}>
          {t('common.edit', lang)}
        </Button>
      </div>

      <div className="mt-2">
        <h2 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[1px] text-text-secondary mb-1.5">
          {t('admin.htmlContent', lang)}
        </h2>
        <div className="min-h-[60px]">
          <InteractiveExam questions={paper.questions} />
        </div>
      </div>
    </div>
  )
}
