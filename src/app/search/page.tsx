'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

interface Lab {
  id: string
  title: string
  title_sw: string | null
  subject: string
  description: string | null
  description_sw: string | null
  is_premium: boolean
  current_version: number
  updated_at: string
}

export default function SearchPage() {
  const { lang } = useLanguage()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Lab[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (query.trim().length < 2) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.data || [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2">{t('nav.subjects', lang)}</h1>
      <p className="text-[14px] text-text-secondary mb-6">{t('student.searchPlaceholder', lang)}</p>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6">
        <div className="flex-1 w-full">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('student.searchPlaceholder', lang)}
            className="w-full"
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 bg-accent-blue text-white text-[14px] font-bold uppercase tracking-[0.5px] hover:opacity-90 transition-opacity disabled:opacity-50 w-full sm:w-auto"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            t('common.search', lang)
          )}
        </button>
      </div>

      {searched && results.length === 0 && !loading && (
        <p className="text-[14px] text-text-secondary">{t('student.noResults', lang)} &quot;{query}&quot;</p>
      )}

      <div className="flex flex-col gap-3">
        {results.map(lab => (
          <Link key={lab.id} href={`/student/${lab.subject}/${lab.id}`}>
            <Card hover interactive>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">{lab.title}</h3>
                  <p className="text-[12px] text-text-secondary mt-1">{lab.subject}{lab.is_premium ? ' · PRO' : ''}</p>
                  {lab.description && <p className="text-[13px] text-text-secondary mt-2 line-clamp-2">{lab.description}</p>}
                </div>
                <Badge variant={lab.subject === 'physics' ? 'info' : lab.subject === 'chemistry' ? 'warning' : 'success'}>
                  {lab.subject}
                </Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
