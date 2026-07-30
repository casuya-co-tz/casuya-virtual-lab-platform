'use client'
import { useEffect, useState, useMemo } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface PastPaper {
  id: string
  subject: string
  year: number
  paper_number: number
  exam_body: string
  title: string
  title_sw: string
  is_premium: boolean
  sort_order: number
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

function SkeletonCard() {
  return (
    <div className="p-2 bg-bg-primary border border-border animate-pulse">
      <div className="h-3 bg-bg-tertiary rounded w-3/4 mb-2" />
      <div className="h-2.5 bg-bg-tertiary rounded w-1/2 mb-2" />
      <div className="flex gap-1 mb-2">
        <div className="h-4 bg-bg-tertiary rounded-full w-12" />
        <div className="h-4 bg-bg-tertiary rounded-full w-10" />
      </div>
      <div className="flex gap-1">
        <div className="h-5 bg-bg-tertiary rounded flex-1" />
        <div className="h-5 bg-bg-tertiary rounded w-12" />
      </div>
    </div>
  )
}

export default function AdminPastPapersPage() {
  const { lang } = useLanguage()
  const router = useRouter()
  const [papers, setPapers] = useState<PastPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/past-papers')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          setPapers(data)
        } else {
          setError('Invalid data format')
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch past papers:', error)
        setError('Failed to load past papers. Please try again later.')
        setLoading(false)
      })
  }, [])

  const subjects = useMemo(() => {
    const set = new Set(papers.map(p => p.subject))
    return Array.from(set)
  }, [papers])

  const filtered = useMemo(() => {
    return papers.filter(p => {
      const matchesSearch = search === '' ||
        (p.subject || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.title_sw || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.year || '').toString().includes(search) ||
        (p.exam_body || '').toLowerCase().includes(search.toLowerCase())
      const matchesSubject = !subjectFilter || p.subject === subjectFilter
      return matchesSearch && matchesSubject
    })
  }, [papers, search, subjectFilter])

  const stats = useMemo(() => {
    const total = papers.length
    const subjectCounts: Record<string, number> = {}
    for (const p of papers) {
      subjectCounts[p.subject] = (subjectCounts[p.subject] || 0) + 1
    }
    return { total, subjectCounts }
  }, [papers])

  return (
    <div className="min-h-screen bg-bg-secondary px-1 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h1 className="text-[clamp(18px,4vw,28px)] font-bold text-text-primary">
            {t('admin.pastPapers', lang)}
          </h1>
          <p className="text-[12px] sm:text-[13px] text-text-secondary mt-0.5">
            {t('admin.pastPapersSubtitle', lang)}
          </p>
        </div>
        <Button variant="primary" onClick={() => router.push('/admin/past-papers/new')} className="sm:w-auto">
          {t('common.add', lang)}
        </Button>
      </div>

      {!loading && !error && stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
          <div className="bg-bg-primary border border-border p-2">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[1px] text-text-secondary font-bold">Total</p>
            <p className="text-[16px] sm:text-[clamp(20px,3vw,26px)] font-bold text-text-primary mt-0.5">{stats.total}</p>
          </div>
          {subjects.map(subject => (
            <div key={subject} className="bg-bg-primary border border-border p-2">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[1px] text-text-secondary font-bold capitalize">{subject}</p>
              <p className="text-[16px] sm:text-[clamp(20px,3vw,26px)] font-bold text-text-primary mt-0.5">{stats.subjectCounts[subject] || 0}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-bg-primary border border-border p-2 sm:p-3 mb-3">
        <div className="relative mb-2">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={`${t('common.search', lang)}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-8 sm:h-9 pl-9 pr-3 bg-bg-secondary border border-border text-[12px] sm:text-[13px] text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-shadow"
          />
        </div>
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSubjectFilter(null)}
              className={`px-2 h-5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.5px] border transition-colors
                ${!subjectFilter
                  ? 'bg-text-primary text-bg-primary border-text-primary'
                  : 'bg-transparent text-text-secondary border-border hover:border-text-secondary'
                }`}
            >
              {t('common.all', lang)}
            </button>
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setSubjectFilter(s === subjectFilter ? null : s)}
                className={`px-2 h-5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.5px] border capitalize transition-colors
                  ${subjectFilter === s
                    ? 'bg-accent-blue text-white border-accent-blue'
                    : 'bg-transparent text-text-secondary border-border hover:border-accent-blue hover:text-accent-blue'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-8 px-2">
          <p className="text-[14px] font-semibold text-text-primary mb-1">Something went wrong</p>
          <p className="text-[12px] text-text-secondary mb-3">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>{t('common.retry', lang)}</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 px-2">
          <p className="text-[14px] font-semibold text-text-primary mb-1">
            {search || subjectFilter ? 'No results found' : t('admin.noPastPapers', lang)}
          </p>
          <p className="text-[12px] text-text-secondary mb-3">
            {search || subjectFilter
              ? 'Try adjusting your search or filters'
              : 'Create your first past paper to get started'}
          </p>
          {!search && !subjectFilter && (
            <Button variant="primary" onClick={() => router.push('/admin/past-papers/new')}>
              {t('common.add', lang)}
            </Button>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-[12px] text-text-secondary tabular-nums">
              {filtered.length} {filtered.length === 1 ? t('common.item', lang) : t('common.items', lang)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map(paper => (
              <div key={paper.id} className="bg-bg-primary border border-border p-2 sm:p-3">
                <div className="flex items-start gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-[12px] sm:text-[14px] font-bold text-text-primary line-clamp-2 leading-snug cursor-pointer hover:text-accent-blue transition-colors"
                      onClick={() => router.push(`/admin/past-papers/${paper.id}`)}
                    >
                      {lang === 'sw' ? paper.title_sw : paper.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-text-secondary mt-0.5 truncate">
                      <span className="capitalize">{paper.subject}</span>
                      {' \u00B7 '}{paper.year}
                      {' \u00B7 '}{t('pastPapers.paper', lang)} {paper.paper_number}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge variant={paper.is_premium ? 'warning' : 'success'} className="text-[8px] sm:text-[9px] !h-4 !px-1.5">
                    {paper.is_premium ? t('pastPapers.premium', lang) : t('common.free', lang)}
                  </Badge>
                  <Badge variant="neutral" className="text-[8px] sm:text-[9px] !h-4 !px-1.5">
                    {paper.exam_body}
                  </Badge>
                  <span className="ml-auto flex gap-1">
                    <button
                      onClick={() => router.push(`/admin/past-papers/${paper.id}`)}
                      className="h-6 sm:h-7 px-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.5px] bg-bg-secondary text-text-primary border border-border-strong hover:bg-bg-hover transition-colors"
                    >
                      {t('common.view', lang)}
                    </button>
                    <button
                      onClick={() => router.push(`/admin/past-papers/${paper.id}/edit`)}
                      className="h-6 sm:h-7 px-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.5px] text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
                    >
                      {t('common.edit', lang)}
                    </button>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
