'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import PastPaperForm from '@/components/admin/PastPaperForm'
import { useRouter, useParams } from 'next/navigation'

export default function EditPastPaperPage() {
  const { lang } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const [paper, setPaper] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/past-papers/${params.id}`)
      .then(r => r.json())
      .then(data => { setPaper(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary px-1 py-2">
        <div className="h-3 bg-bg-tertiary rounded w-36 mb-2 animate-pulse" />
        <div className="h-4 bg-bg-tertiary rounded w-1/3 mb-2 animate-pulse" />
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-2 bg-bg-tertiary rounded w-12 mb-1" />
              <div className="h-6 bg-bg-tertiary rounded w-full" />
            </div>
          ))}
        </div>
        <div className="h-20 bg-bg-tertiary rounded" />
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center px-1">
        <div className="text-center">
          <p className="text-[14px] font-semibold text-text-primary mb-1">{t('error.notFound', lang)}</p>
          <p className="text-[12px] text-text-secondary mb-3">The past paper could not be found</p>
          <Button variant="primary" onClick={() => router.push('/admin/past-papers')}>
            {t('common.back', lang)}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary px-1 py-2">
      <nav className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-text-secondary mb-2 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
        <button onClick={() => router.push('/admin/past-papers')} className="hover:text-text-primary transition-colors shrink-0">
          {t('admin.pastPapers', lang)}
        </button>
        <svg className="w-2.5 h-2.5 shrink-0 text-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-text-primary truncate max-w-[100px] sm:max-w-[200px]">
          {String(lang === 'sw' ? paper.title_sw : paper.title)}
        </span>
        <svg className="w-2.5 h-2.5 shrink-0 text-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-text-primary">{t('common.edit', lang)}</span>
      </nav>

      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-accent-amber/10 text-accent-amber border border-accent-amber/20 text-[11px] sm:text-[13px] font-bold shrink-0">
          ~
        </div>
        <div className="min-w-0">
          <h1 className="text-[15px] sm:text-[clamp(18px,3.5vw,24px)] font-bold text-text-primary">{t('admin.editPastPaper', lang)}</h1>
          <p className="text-[11px] sm:text-[12px] text-text-secondary mt-0.5 truncate max-w-[150px] sm:max-w-md">
            {lang === 'sw' ? String(paper.title_sw) : String(paper.title)}
          </p>
        </div>
      </div>
      <PastPaperForm
        mode="edit"
        initialData={{
          id: paper.id as string,
          subject: paper.subject as string,
          year: String(paper.year),
          paper_number: String(paper.paper_number),
          exam_body: paper.exam_body as string,
          title: paper.title as string,
          title_sw: paper.title_sw as string,
          is_premium: paper.is_premium as boolean,
          sort_order: String(paper.sort_order),
          html_content: (() => {
            const q = paper.questions
            if (typeof q === 'object' && q && '_html' in q) return String((q as Record<string, unknown>)._html)
            return ''
          })(),
        }}
      />
    </div>
  )
}
