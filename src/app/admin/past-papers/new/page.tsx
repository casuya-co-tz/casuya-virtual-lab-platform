'use client'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import PastPaperForm from '@/components/admin/PastPaperForm'
import { useRouter } from 'next/navigation'

export default function NewPastPaperPage() {
  const { lang } = useLanguage()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-bg-secondary px-1 py-2">
      <nav className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-text-secondary mb-2">
        <button onClick={() => router.push('/admin/past-papers')} className="hover:text-text-primary transition-colors shrink-0">
          {t('admin.pastPapers', lang)}
        </button>
        <svg className="w-2.5 h-2.5 shrink-0 text-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-text-primary">{t('admin.newPastPaper', lang)}</span>
      </nav>

      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-accent-blue/10 text-accent-blue border border-accent-blue/20 text-[12px] sm:text-[14px] font-bold shrink-0">
          +
        </div>
        <div className="min-w-0">
          <h1 className="text-[16px] sm:text-[clamp(18px,3.5vw,24px)] font-bold text-text-primary">{t('admin.newPastPaper', lang)}</h1>
          <p className="text-[11px] sm:text-[12px] text-text-secondary mt-0.5">Create a new past paper practical for students</p>
        </div>
      </div>
      <PastPaperForm mode="create" />
    </div>
  )
}
